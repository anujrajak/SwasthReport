"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
  type PatientWithId,
} from "@/utils/firestore/patients";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Loader2, Edit, Trash2, Users, ChevronLeftIcon, ChevronRightIcon, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

const patientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.coerce.number().min(0, "Age must be a positive number"),
  gender: z.enum(["Male", "Female", "Other"]),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
});

type PatientFormValues = z.infer<typeof patientSchema>;

export default function PatientsPage() {
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [patients, setPatients] = useState<PatientWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientWithId | null>(
    null
  );
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [pageHistory, setPageHistory] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      age: 0,
      gender: "Male",
      phone: "",
      email: "",
    },
  });

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setLoading(false);
      return;
    }

    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser?.uid]);

  const fetchPatients = async (lastDocument?: QueryDocumentSnapshot<DocumentData> | null, resetHistory = false) => {
    if (!firebaseUser?.uid) return;

    try {
      setLoading(true);
      const result = await getPatients(firebaseUser.uid, 50, lastDocument || undefined);
      setPatients(result.patients);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
      
      if (resetHistory) {
        setPageHistory([]);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error);
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = async () => {
    if (!lastDoc || !hasMore) return;
    
    // Save current lastDoc to history for back navigation (before fetching next page)
    const currentLastDoc = lastDoc;
    setPageHistory((prev) => [...prev, currentLastDoc]);
    setCurrentPage((prev) => prev + 1);
    await fetchPatients(currentLastDoc, false);
  };

  const handlePreviousPage = async () => {
    if (currentPage === 1) return;
    
    const newHistory = [...pageHistory];
    newHistory.pop(); // Remove current page from history
    setPageHistory(newHistory);
    const newPage = currentPage - 1;
    setCurrentPage(newPage);

    // If going back to page 1, fetch with null
    if (newPage === 1) {
      await fetchPatients(null, true);
    } else {
      // Fetch with the previous page's lastDoc (the one we saved before going to current page)
      const previousLastDoc = newHistory[newHistory.length - 1];
      await fetchPatients(previousLastDoc, false);
    }
  };

  const onSubmit = async (values: PatientFormValues) => {
    if (!firebaseUser?.uid) {
      toast.error("User not authenticated");
      return;
    }

    const isEditing = !!editingPatient;
    const toastId = toast.loading(
      isEditing ? "Updating patient..." : "Adding patient..."
    );

    try {
      setSaving(true);
      if (editingPatient) {
        await updatePatient(firebaseUser.uid, editingPatient.id, values);
        toast.success(`Patient "${values.name}" updated successfully`, {
          id: toastId,
        });
      } else {
        await createPatient(firebaseUser.uid, values);
        toast.success(`Patient "${values.name}" added successfully`, {
          id: toastId,
        });
      }
      setDrawerOpen(false);
      form.reset();
      setEditingPatient(null);
      await fetchPatients(null, true);
    } catch (error) {
      console.error("Failed to save patient:", error);
      toast.error(
        isEditing
          ? "Failed to update patient. Please try again."
          : "Failed to add patient. Please try again.",
        { id: toastId }
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (patient: PatientWithId) => {
    setEditingPatient(patient);
    form.reset({
      name: patient.name,
      age: patient.age,
      gender: patient.gender as "Male" | "Female" | "Other",
      phone: patient.phone || "",
      email: patient.email || "",
    });
    setDrawerOpen(true);
  };

  const handleDelete = async (patientId: string) => {
    if (!firebaseUser?.uid) {
      toast.error("User not authenticated");
      return;
    }

    const patient = patients.find((p) => p.id === patientId);
    const patientName = patient?.name || "Patient";
    const toastId = toast.loading(`Deleting ${patientName}...`);

    try {
      setDeleting(patientId);
      await deletePatient(firebaseUser.uid, patientId);
      toast.success(`${patientName} deleted successfully`, { id: toastId });
      await fetchPatients();
    } catch (error) {
      console.error("Failed to delete patient:", error);
      toast.error(`Failed to delete ${patientName}. Please try again.`, {
        id: toastId,
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleDrawerOpenChange = (open: boolean) => {
    setDrawerOpen(open);
    if (!open) {
      form.reset({
        name: "",
        age: 0,
        gender: "Male",
        phone: "",
        email: "",
      });
      setEditingPatient(null);
    }
  };

  const handleAddPatient = () => {
    setEditingPatient(null);
    form.reset({
      name: "",
      age: 0,
      gender: "Male",
      phone: "",
      email: "",
    });
    setDrawerOpen(true);
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">Manage your patient records</p>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Users className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Not Authenticated</h2>
        <p className="text-muted-foreground">Please log in to view patients</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">Manage your patient records</p>
        </div>
        <Drawer open={drawerOpen} onOpenChange={handleDrawerOpenChange}>
          <DrawerTrigger asChild>
            <Button onClick={handleAddPatient}>
              <Plus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>
                  {editingPatient ? "Edit Patient" : "Add New Patient"}
                </DrawerTitle>
                <DrawerDescription>
                  {editingPatient
                    ? "Update patient information below."
                    : "Enter patient details to add a new record."}
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4 pb-0">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter patient name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Age"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
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
                              placeholder="Enter phone number"
                              {...field}
                            />
                          </FormControl>
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
                              placeholder="Enter email address (optional)"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Email address (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DrawerFooter>
                      <Button type="submit" disabled={saving}>
                        {saving && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {saving
                          ? "Saving..."
                          : editingPatient
                          ? "Update"
                          : "Add Patient"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleDrawerOpenChange(false)}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    </DrawerFooter>
                  </form>
                </Form>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
          <CardDescription>
            A list of all your patients. You can add, edit, or delete records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No patients found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first patient.
              </p>
              <Button onClick={handleAddPatient}>
                <Plus className="mr-2 h-4 w-4" />
                Add Patient
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      {patient.name}
                    </TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>{patient.gender}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>{patient.email || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() =>
                            router.push(`/dashboard/patients/${patient.id}/reports`)
                          }
                          className="gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          <span className="hidden sm:inline">View Reports</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => handleEdit(patient)}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="default"
                              disabled={deleting === patient.id}
                              className="gap-2"
                            >
                              {deleting === patient.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span className="hidden sm:inline">Deleting...</span>
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4" />
                                  <span className="hidden sm:inline">Delete</span>
                                </>
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the patient record for{" "}
                                <strong>{patient.name}</strong>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(patient.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {patients.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {patients.length} patient{patients.length !== 1 ? "s" : ""}
                {hasMore && " (more available)"}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="default"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="gap-1 px-2.5 sm:pl-2.5"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  <span className="hidden sm:block">Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled
                  className="pointer-events-none"
                >
                  {currentPage}
                </Button>
                <Button
                  variant="ghost"
                  size="default"
                  onClick={handleNextPage}
                  disabled={!hasMore}
                  className="gap-1 px-2.5 sm:pr-2.5"
                >
                  <span className="hidden sm:block">Next</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
