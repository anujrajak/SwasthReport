
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  getUser,
  updateUser,
  type User as FirestoreUser,
} from "@/utils/firestore/users";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Loader2, Plus, Trash2 } from "lucide-react";

const userSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().or(z.literal("")),
  photoURL: z.string().url("Invalid URL").optional().or(z.literal("")),
  labName: z.string().optional().or(z.literal("")),
  labAddress: z.string().optional().or(z.literal("")),
  labContacts: z.array(z.string()),
  enableHeaderFooter: z.boolean().default(true),
  topMargin: z.number().min(0).max(100).default(15),
  bottomMargin: z.number().min(0).max(100).default(15),
  pathologistName: z.string().optional().or(z.literal("")),
  pathologistTitle: z.string().optional().or(z.literal("")),
  pathologistSignature: z.string().optional().or(z.literal("")),
  labLogo: z.string().optional().or(z.literal("")),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function LabDetailsPage() {
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      displayName: "",
      email: "",
      phone: "",
      photoURL: "",
      labName: "",
      labAddress: "",
      labContacts: [],
      enableHeaderFooter: true,
      topMargin: 15,
      bottomMargin: 15,
      pathologistName: "",
      pathologistTitle: "",
      pathologistSignature: "",
      labLogo: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    // @ts-expect-error - useFieldArray type inference issue with array fields
    name: "labContacts",
  });

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await getUser(firebaseUser.uid);
        if (data) {
          setUserData(data);
          form.reset({
            displayName: data.displayName || "",
            email: data.email || "",
            phone: data.phone || "",
            photoURL: data.photoURL || "",
            labName: data.labName || "",
            labAddress: data.labAddress || "",
            labContacts:
              data.labContacts && data.labContacts.length > 0
                ? data.labContacts
                : [],
            enableHeaderFooter: data.enableHeaderFooter ?? true,
            topMargin: data.topMargin ?? 15,
            bottomMargin: data.bottomMargin ?? 15,
            pathologistName: data.pathologistName || "",
            pathologistTitle: data.pathologistTitle || "",
            pathologistSignature: data.pathologistSignature || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [firebaseUser?.uid, form]);

  const onSubmit = async (values: UserFormValues) => {
    if (!firebaseUser?.uid) {
      toast.error("User not authenticated");
      return;
    }

    // Validate pathologist details if they're being set for the first time
    if (!userData?.pathologistName) {
      if (!values.pathologistName || values.pathologistName.trim() === "") {
        toast.error("Pathologist name is required");
        return;
      }
      if (!values.pathologistTitle || values.pathologistTitle.trim() === "") {
        toast.error("Pathologist title is required");
        return;
      }
    }

    const toastId = toast.loading("Saving lab details...");

    try {
      setSaving(true);
      await updateUser(firebaseUser.uid, {
        displayName: values.displayName,
        email: values.email,
        phone: values.phone,
        photoURL: values.photoURL,
        labName: values.labName,
        labAddress: values.labAddress,
        labContacts: values.labContacts,
        enableHeaderFooter: values.enableHeaderFooter,
        topMargin: values.topMargin,
        bottomMargin: values.bottomMargin,
        pathologistName: values.pathologistName,
        pathologistTitle: values.pathologistTitle,
        pathologistSignature: values.pathologistSignature,
        labLogo: values.labLogo,
      });

      // Update local state
      setUserData({
        displayName: values.displayName,
        email: values.email,
        phone: values.phone || undefined,
        photoURL: values.photoURL || undefined,
        labName: values.labName || undefined,
        labAddress: values.labAddress || undefined,
        labContacts:
          values.labContacts && values.labContacts.length > 0
            ? values.labContacts
            : undefined,
        enableHeaderFooter: values.enableHeaderFooter,
        topMargin: values.topMargin,
        bottomMargin: values.bottomMargin,
        pathologistName: values.pathologistName || undefined,
        pathologistTitle: values.pathologistTitle || undefined,
        pathologistSignature: values.pathologistSignature || undefined,
      });

      toast.success("Lab details updated successfully", { id: toastId });
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Failed to update lab details. Please try again.", {
        id: toastId,
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lab Details</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <User className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Not Authenticated</h2>
        <p className="text-muted-foreground">
          Please log in to view your details
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lab Details</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Update your personal information. Changes will be saved to your
            account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your display name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Your email address for account notifications.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter your phone number"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Your contact phone number (optional).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="photoURL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Photo URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/photo.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      URL to your profile photo (optional).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Lab Information</h3>
              </div>

              <FormField
                control={form.control}
                name="labLogo"
                render={({ field }) => {
                  const handleLogoUpload = (
                    e: React.ChangeEvent<HTMLInputElement>
                  ) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    // Validate file type
                    if (!file.type.startsWith("image/")) {
                      toast.error("Please upload an image file");
                      return;
                    }

                    // Validate file size (max 2MB)
                    if (file.size > 2 * 1024 * 1024) {
                      toast.error("Image size should be less than 2MB");
                      return;
                    }

                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64String = reader.result as string;
                      field.onChange(base64String);
                    };
                    reader.onerror = () => {
                      toast.error("Failed to read image file");
                    };
                    reader.readAsDataURL(file);
                  };

                  return (
                    <FormItem>
                      <FormLabel>Lab Logo/Image (Optional)</FormLabel>
                      <FormControl>
                        <>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                          />
                          {field.value && (
                            <div className="mt-2">
                              <img
                                src={field.value}
                                alt="Lab Logo Preview"
                                className="max-w-[150px] max-h-[150px] border rounded-md"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => field.onChange("")}
                                className="mt-1 text-red-500 hover:text-red-600"
                              >
                                Remove Logo
                              </Button>
                            </div>
                          )}
                        </>
                      </FormControl>
                      <FormDescription>
                        Upload lab logo/image for report header (image, max 2MB).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="labName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lab Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter lab name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Name of your laboratory (optional).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="labAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lab Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter lab address"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Full address of your laboratory (optional).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <FormLabel>Lab Contacts</FormLabel>
                    <FormDescription className="mt-0">
                      Phone numbers for your laboratory (optional).
                    </FormDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append("")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </div>

                {fields.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No contacts added. Click &quot;Add Contact&quot; to add a
                    phone number.
                  </p>
                )}

                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`labContacts.${index}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              type="tel"
                              placeholder="Enter phone number"
                              {...field}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const contactToRemove = fields[index];
                                remove(index);
                                toast.success(
                                  `Contact "${
                                    contactToRemove || "phone number"
                                  }" removed`
                                );
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Pathologist Details</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Once saved, these fields will be disabled. To modify, contact support.
                </p>
              </div>

              <FormField
                control={form.control}
                name="pathologistName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pathologist Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter pathologist name"
                        {...field}
                        disabled={!!userData?.pathologistName}
                        className={userData?.pathologistName ? "bg-muted" : ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Full name of the pathologist (required).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pathologistTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pathologist Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter pathologist title (e.g., MD, PhD)"
                        {...field}
                        disabled={!!userData?.pathologistName}
                        className={userData?.pathologistName ? "bg-muted" : ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Professional title or designation (required).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pathologistSignature"
                render={({ field }) => {
                  const handleSignatureUpload = (
                    e: React.ChangeEvent<HTMLInputElement>
                  ) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    // Check if file is an image
                    if (!file.type.startsWith("image/")) {
                      toast.error("Please upload an image file");
                      return;
                    }

                    // Check file size (max 2MB)
                    if (file.size > 2 * 1024 * 1024) {
                      toast.error("Image size should be less than 2MB");
                      return;
                    }

                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64String = reader.result as string;
                      field.onChange(base64String);
                    };
                    reader.onerror = () => {
                      toast.error("Failed to read image file");
                    };
                    reader.readAsDataURL(file);
                  };

                  return (
                    <FormItem>
                      <FormLabel>Signature</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleSignatureUpload}
                            disabled={!!userData?.pathologistName}
                            className={userData?.pathologistName ? "bg-muted" : ""}
                          />
                          {field.value && (
                            <div className="mt-2">
                              <img
                                src={field.value}
                                alt="Signature preview"
                                className="max-w-xs border rounded p-2 bg-white"
                                style={{ maxHeight: "100px" }}
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload pathologist signature image (optional). Will be saved as base64.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">PDF Settings</h3>
              </div>

              <FormField
                control={form.control}
                name="enableHeaderFooter"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Enable header and footer</FormLabel>
                      <FormDescription>
                        When enabled, header and footer will be shown on PDF reports.
                        When disabled, custom top and bottom margins will be used instead.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {!form.watch("enableHeaderFooter") && (
                <>
                  <FormField
                    control={form.control}
                    name="topMargin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Top Margin (mm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="15"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Top margin in millimeters for PDF reports when header/footer is disabled.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bottomMargin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bottom Margin (mm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="15"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Bottom margin in millimeters for PDF reports when header/footer is disabled.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (userData) {
                      form.reset({
                        displayName: userData.displayName || "",
                        email: userData.email || "",
                        phone: userData.phone || "",
                        photoURL: userData.photoURL || "",
                        labName: userData.labName || "",
                        labAddress: userData.labAddress || "",
                        labContacts:
                          userData.labContacts &&
                          userData.labContacts.length > 0
                            ? userData.labContacts
                            : [],
                        enableHeaderFooter: userData.enableHeaderFooter ?? true,
                        topMargin: userData.topMargin ?? 15,
                        bottomMargin: userData.bottomMargin ?? 15,
                        pathologistName: userData.pathologistName || "",
                        pathologistTitle: userData.pathologistTitle || "",
                        pathologistSignature: userData.pathologistSignature || "",
                      });
                    }
                  }}
                  disabled={saving}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
