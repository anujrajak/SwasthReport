import { useEffect, useState, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import {
  getPatients,
  getPatient,
  type PatientWithId,
} from "@/utils/firestore/patients";
import { useSearchParams } from "react-router-dom";
import { createReport } from "@/utils/firestore/reports";
import { testsData } from "@/lib/constants/tests-data";
import { toast } from "sonner";
import { Timestamp } from "firebase/firestore";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverAnchor,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Check,
  ChevronsUpDown,
  Users,
  Plus,
  X,
  ChevronDown,
  Info,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import { cn, calculateFormula } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const testParameterSchema = z.object({
  name: z.string(),
  value: z.union([z.number(), z.string()]).optional(),
});

const testSchema = z.object({
  testId: z.string().min(1, "Please select a test"),
  parameters: z.array(testParameterSchema),
  comment: z.string().optional().or(z.literal("")),
});

const reportSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  patientAge: z.coerce.number().min(0, "Age must be a positive number"),
  patientGender: z.enum(["Male", "Female", "Other"]),
  patientPhone: z.string().min(10, "Phone number is required"),
  patientEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  doctor: z.string().min(1, "Doctor name is required"),
  title: z.string().optional(),
  registeredDate: z.date(),
  collectedDate: z.date(),
  tests: z.array(testSchema).min(1, "At least one test is required"),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export default function MakeReportPage() {
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [patients, setPatients] = useState<PatientWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientWithId | null>(
    null
  );
  const [testPopovers, setTestPopovers] = useState<Record<number, boolean>>({});
  const [openCards, setOpenCards] = useState<Record<number, boolean>>({});
  const [manuallyEditedParams, setManuallyEditedParams] = useState<Set<string>>(new Set());

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      patientName: "",
      patientAge: 0,
      patientGender: "Male",
      patientPhone: "",
      patientEmail: "",
      doctor: "Self",
      title: "",
      registeredDate: new Date(), // Will be updated when patient is selected
      collectedDate: new Date(), // Default to today
      tests: [],
    },
  });

  const { fields, insert, remove } = useFieldArray({
    control: form.control,
    name: "tests",
  });

  // Watch all test parameters for formula calculations
  const allTestValues = form.watch("tests");

  // Function to recalculate formulas for a specific test
  const recalculateFormulas = useCallback((testIndex: number) => {
    const currentTests = form.getValues("tests");
    const test = currentTests[testIndex];
    if (!test?.testId) return;
    
    const testData = testsData[test.testId as keyof typeof testsData];
    if (!testData) return;

    const parameters = test.parameters || [];
    const paramValues: Record<string, number | string | undefined> = {};
    
    // Build map of parameter values - use exact parameter names from constants
    // Match form parameters with constants parameters by index
    parameters.forEach((param, idx) => {
      if (idx < testData.parameters.length) {
        const paramDefName = testData.parameters[idx].name;
        if (param.value !== undefined && param.value !== null && param.value !== "") {
          const numValue = typeof param.value === "string" ? parseFloat(param.value) : param.value;
          if (!isNaN(numValue) && isFinite(numValue)) {
            // Use the parameter name from constants (not from form, in case they differ)
            paramValues[paramDefName] = numValue;
            // Also add the form parameter name in case formula uses it
            if (param.name !== paramDefName) {
              paramValues[param.name] = numValue;
            }
          }
        }
      }
    });


    // Check each parameter for formulas and calculate
    parameters.forEach((param, paramIndex) => {
      const paramDef = testData.parameters[paramIndex];
      if (paramDef?.formula) {
        const paramKey = `${test.testId}-${param.name}`;
        const wasManuallyEdited = manuallyEditedParams.has(paramKey);
        
        // Only auto-calculate if not manually edited AND field is empty
        // Once a value is set, it won't auto-update unless refresh icon is clicked
        if (!wasManuallyEdited) {
          const currentValue = form.getValues(`tests.${testIndex}.parameters.${paramIndex}.value`);
          
          // Only calculate if the field is empty
          if (currentValue === undefined || currentValue === "" || currentValue === null) {
            const calculatedValue = calculateFormula(paramDef.formula, paramValues);
            
            if (calculatedValue !== null) {
              const calculatedStr = String(calculatedValue);
              form.setValue(
                `tests.${testIndex}.parameters.${paramIndex}.value`,
                calculatedStr,
                { shouldValidate: false, shouldDirty: false }
              );
              // Mark as manually edited so it won't auto-update when dependencies change
              setManuallyEditedParams(prev => new Set(prev).add(paramKey));
            }
          }
        }
      }
    });
  }, [form, manuallyEditedParams]);

  // Calculate formula values when parameters change
  useEffect(() => {
    // Use a small delay to ensure form values are updated
    const timeoutId = setTimeout(() => {
      allTestValues.forEach((_, testIndex) => {
        recalculateFormulas(testIndex);
      });
    }, 100); // Delay to ensure form state is updated

    return () => clearTimeout(timeoutId);
  }, [allTestValues, recalculateFormulas]);

  // Also watch for individual parameter changes more directly
  const watchedParams = form.watch((data) => {
    return data.tests?.map(test => 
      test.parameters?.map(p => p.value)
    );
  });
  
  useEffect(() => {
    if (watchedParams) {
      const timeoutId = setTimeout(() => {
        allTestValues.forEach((_, testIndex) => {
          recalculateFormulas(testIndex);
        });
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [watchedParams, recalculateFormulas, allTestValues]);

  useEffect(() => {
    if (!firebaseUser?.uid) {
      setLoading(false);
      return;
    }

    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser?.uid]);

  // Handle patientId from URL query parameter
  useEffect(() => {
    const patientIdFromUrl = searchParams.get("patientId");
    if (patientIdFromUrl && firebaseUser?.uid && !selectedPatient) {
      // First try to find in the loaded patients list
      if (patients.length > 0) {
        const patient = patients.find((p) => p.id === patientIdFromUrl);
        if (patient) {
          handlePatientSelect(patient);
          return;
        }
      }

      // If not found in list or list not loaded yet, fetch it directly
      getPatient(firebaseUser.uid, patientIdFromUrl)
        .then((patientData) => {
          if (patientData) {
            handlePatientSelect(patientData);
          } else {
            toast.error("Patient not found");
          }
        })
        .catch((error) => {
          console.error("Failed to fetch patient:", error);
          toast.error("Failed to load patient");
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, firebaseUser?.uid, patients, selectedPatient]);

  const fetchPatients = async () => {
    if (!firebaseUser?.uid) return;

    try {
      setLoading(true);
      const result = await getPatients(firebaseUser.uid, 1000); // Fetch a large number for the dropdown
      setPatients(result.patients);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient: PatientWithId) => {
    setSelectedPatient(patient);
    form.setValue("patientName", patient.name);
    form.setValue("patientAge", patient.age);
    form.setValue(
      "patientGender",
      patient.gender as "Male" | "Female" | "Other"
    );
    form.setValue("patientPhone", patient.phone);
    form.setValue("patientEmail", patient.email || "");

    // Set registered date from patient's createdAt
    const registeredDate = patient.createdAt
      ? patient.createdAt instanceof Timestamp
        ? patient.createdAt.toDate()
        : patient.createdAt
      : new Date(); // Fallback to current date if no createdAt
    form.setValue("registeredDate", registeredDate);

    // Set collected date to today
    form.setValue("collectedDate", new Date());

    setOpen(false);
    toast.success(`Patient "${patient.name}" selected`);
  };

  const handleTestSelect = (testIndex: number, testId: string) => {
    const test = testsData[testId as keyof typeof testsData];
    if (!test) return;

    const parameters = test.parameters.map((param) => ({
      name: param.name,
      value: undefined,
    }));

    // Clear manual edit flags for this test
    setManuallyEditedParams(prev => {
      const newSet = new Set(prev);
      Array.from(newSet).forEach(key => {
        if (key.startsWith(`${testId}-`)) {
          newSet.delete(key);
        }
      });
      return newSet;
    });

    form.setValue(`tests.${testIndex}.testId`, testId);
    form.setValue(`tests.${testIndex}.parameters`, parameters);
    setTestPopovers((prev) => ({ ...prev, [testIndex]: false }));
    toast.success(`Test "${test.name}" added`);
  };

  const handleAddTest = () => {
    insert(0, {
      testId: "",
      parameters: [],
      comment: "",
    });
    // Open the newly added card and shift existing indices
    setOpenCards((prev) => {
      const newCards: Record<number, boolean> = { 0: true };
      Object.entries(prev).forEach(([key, value]) => {
        newCards[Number(key) + 1] = value;
      });
      return newCards;
    });
  };

  const getTestOptions = () => {
    return Object.entries(testsData).map(([key, value]) => ({
      id: key,
      name: value.name,
      category: value.category,
    }));
  };

  const getTestOptionsByCategory = () => {
    const options = getTestOptions();
    const grouped: Record<string, typeof options> = {};
    options.forEach((option) => {
      if (!grouped[option.category]) {
        grouped[option.category] = [];
      }
      grouped[option.category].push(option);
    });
    return grouped;
  };

  const getSelectedTest = (testId: string) => {
    return testsData[testId as keyof typeof testsData];
  };

  const onSubmit = async (values: ReportFormValues) => {
    if (!firebaseUser?.uid) {
      toast.error("User not authenticated");
      return;
    }

    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }

    if (values.tests.length === 0) {
      toast.error("Please add at least one test");
      return;
    }

    const toastId = toast.loading("Creating report...");

    try {
      // Transform form data to report structure
      const testsDataForReport: Record<
        string,
        {
          name: string;
          category: string;
          parameters: Record<
            string,
            {
              value: number | string;
              unit: string;
              range: string | Record<string, string>;
            }
          >;
        }
      > = {};

      // Process each test
      values.tests.forEach((test) => {
        const testInfo = getSelectedTest(test.testId);
        if (!testInfo) return;

        const parametersData: Record<
          string,
          {
            value: number | string;
            unit: string;
            range: string | { male: string; female: string };
          }
        > = {};

        // Process each parameter
        test.parameters.forEach((param, paramIndex) => {
          const paramDef = testInfo.parameters[paramIndex];
          if (!paramDef) return;

          parametersData[param.name] = {
            value: param.value ?? "",
            unit: paramDef.unit,
            range: paramDef.range as string | Record<string, string>,
          };
        });

        // Only include comment if it has a value
        const testData: {
          name: string;
          category: string;
          parameters: Record<
            string,
            {
              value: number | string;
              unit: string;
              range: string | Record<string, string>;
            }
          >;
          comment?: string;
        } = {
          name: testInfo.name,
          category: testInfo.category,
          parameters: parametersData,
        };

        // Only add comment if it exists and is not empty
        if (test.comment && test.comment.trim() !== "") {
          testData.comment = test.comment.trim();
        }

        testsDataForReport[test.testId] = testData;
      });

      // Create report with form values
      // Use collectedDate as the main date for backward compatibility
      const reportDate = values.collectedDate
        ? Timestamp.fromDate(values.collectedDate)
        : Timestamp.now();

      const registeredDate = values.registeredDate
        ? Timestamp.fromDate(values.registeredDate)
        : Timestamp.now();

      const collectedDate = values.collectedDate
        ? Timestamp.fromDate(values.collectedDate)
        : Timestamp.now();

      await createReport(firebaseUser.uid, selectedPatient.id, {
        date: reportDate, // Use collectedDate for backward compatibility
        doctor: values.doctor,
        title: values.title || "",
        tests: testsDataForReport,
        registeredDate,
        collectedDate,
      });

      const testCount = values.tests.length;
      toast.success(
        `Report created successfully for ${
          selectedPatient.name
        } (${testCount} test${testCount !== 1 ? "s" : ""})`,
        { id: toastId }
      );

      // Reset form after successful submission
      form.reset({
        patientName: "",
        patientAge: 0,
        patientGender: "Male",
        patientPhone: "",
        patientEmail: "",
        doctor: "Self",
        title: "",
        registeredDate: new Date(),
        collectedDate: new Date(),
        tests: [],
      });
      setSelectedPatient(null);
      setTestPopovers({});
      setOpenCards({});
    } catch (error) {
      console.error("Failed to create report:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error details:", {
        error,
        errorMessage,
        patientId: selectedPatient?.id,
        doctor: values.doctor,
        title: values.title,
        testCount: values.tests.length,
      });
      toast.error(
        `Failed to create report: ${errorMessage}. Please check the console for details.`,
        { id: toastId }
      );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Make Report</h1>
          <p className="text-muted-foreground">
            Create a new pathology report for a patient
          </p>
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
        <p className="text-muted-foreground">Please log in to create reports</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Make Report</h1>
        <p className="text-muted-foreground">
          Create a new pathology report for a patient
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
          <CardDescription>
            Search and select a patient to populate their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Patient</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? patients.find(
                                (patient) => patient.name === field.value
                              )?.name || "Select patient..."
                            : "Select patient..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[400px] p-0 z-[100]"
                        align="start"
                      >
                        <Command>
                          <CommandInput placeholder="Search patients..." />
                          <CommandList>
                            <CommandEmpty>No patients found.</CommandEmpty>
                            <CommandGroup>
                              {patients.map((patient) => (
                                <CommandItem
                                  key={patient.id}
                                  value={patient.name}
                                  onSelect={() => handlePatientSelect(patient)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedPatient?.id === patient.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{patient.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {patient.age} years, {patient.gender} •{" "}
                                      {patient.phone}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormControl>
                      <input
                        type="hidden"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Search for a patient by name to auto-fill their details
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Patient name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="patientAge"
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
                          readOnly
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patientGender"
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
                  name="patientPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Phone number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="patientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Email address (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Email address (optional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="doctor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor</FormLabel>
                    <FormControl>
                      <Input placeholder="Doctor name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="registeredDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registered Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value
                              ? new Date(field.value)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          disabled
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormDescription>
                        Date when patient was registered (auto-filled from
                        patient record)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collectedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collected Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value
                              ? new Date(field.value)
                                  .toISOString()
                                  .split("T")[0]
                              : new Date().toISOString().split("T")[0]
                          }
                          onChange={(e) => {
                            field.onChange(new Date(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Date when sample was collected (defaults to today)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Tests</h3>
                    <p className="text-sm text-muted-foreground">
                      Add one or more tests and enter their parameter values
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTest}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Test
                  </Button>
                </div>

                {fields.length === 0 && (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      No tests added. Click "Add Test" to get started.
                    </p>
                  </div>
                )}

                <div className="space-y-6">
                  {fields.map((field, index) => {
                    const selectedTest = form.watch(`tests.${index}.testId`)
                      ? getSelectedTest(form.watch(`tests.${index}.testId`))
                      : null;
                    const parameters =
                      form.watch(`tests.${index}.parameters`) || [];
                    const isOpen = openCards[index] ?? true; // Default to open for new cards

                    return (
                      <Card
                        key={field.id}
                        className="relative overflow-visible"
                      >
                        <Collapsible
                          open={isOpen}
                          onOpenChange={(open) =>
                            setOpenCards((prev) => ({ ...prev, [index]: open }))
                          }
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="flex items-center gap-2 p-0 h-auto hover:bg-transparent"
                                >
                                  <CardTitle className="text-base">
                                    {selectedTest
                                      ? selectedTest.name
                                      : `Test ${index + 1}`}
                                  </CardTitle>
                                  <ChevronDown
                                    className={cn(
                                      "h-4 w-4 transition-transform",
                                      isOpen && "transform rotate-180"
                                    )}
                                  />
                                </Button>
                              </CollapsibleTrigger>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const testToRemove = fields[index];
                                  const testInfo = testToRemove?.testId
                                    ? getSelectedTest(testToRemove.testId)
                                    : null;
                                  // Clean up manual edit flags for this test
                                  if (testToRemove?.testId) {
                                    setManuallyEditedParams(prev => {
                                      const newSet = new Set(prev);
                                      Array.from(newSet).forEach(key => {
                                        if (key.startsWith(`${testToRemove.testId}-`)) {
                                          newSet.delete(key);
                                        }
                                      });
                                      return newSet;
                                    });
                                  }
                                  
                                  remove(index);
                                  if (testInfo) {
                                    toast.success(
                                      `Test "${testInfo.name}" removed`
                                    );
                                  }
                                  // Reindex remaining cards after removal
                                  setOpenCards((prev) => {
                                    const newCards: Record<number, boolean> =
                                      {};
                                    Object.entries(prev).forEach(
                                      ([key, value]) => {
                                        const keyNum = Number(key);
                                        if (keyNum < index) {
                                          newCards[keyNum] = value;
                                        } else if (keyNum > index) {
                                          newCards[keyNum - 1] = value;
                                        }
                                      }
                                    );
                                    return newCards;
                                  });
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CollapsibleContent className="overflow-visible">
                            <CardContent className="space-y-4 overflow-visible">
                              <FormField
                                control={form.control}
                                name={`tests.${index}.testId`}
                                render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                    <FormLabel>Select Test</FormLabel>
                                    <Popover
                                      open={testPopovers[index] || false}
                                      onOpenChange={(open) => {
                                        setTestPopovers((prev) => ({
                                          ...prev,
                                          [index]: open,
                                        }));
                                      }}
                                    >
                                      <PopoverTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          role="combobox"
                                          className={cn(
                                            "w-full justify-between",
                                            !field.value &&
                                              "text-muted-foreground"
                                          )}
                                        >
                                          {field.value
                                            ? getSelectedTest(field.value)
                                                ?.name || "Select test..."
                                            : "Select test..."}
                                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent
                                        className="w-[300px] p-0"
                                        align="start"
                                        side="bottom"
                                      >
                                        <Command>
                                          <CommandInput placeholder="Search tests..." />
                                          <CommandList>
                                            <CommandEmpty>
                                              No tests found.
                                            </CommandEmpty>
                                            {Object.entries(
                                              getTestOptionsByCategory()
                                            ).map(([category, items]) => (
                                              <CommandGroup
                                                key={category}
                                                heading={category}
                                              >
                                                {items.map((test) => (
                                                  <CommandItem
                                                    key={test.id}
                                                    value={`${test.name} ${test.category}`}
                                                    onSelect={() => {
                                                      handleTestSelect(
                                                        index,
                                                        test.id
                                                      );
                                                    }}
                                                  >
                                                    <Check
                                                      className={cn(
                                                        "mr-2 h-4 w-4",
                                                        field.value === test.id
                                                          ? "opacity-100"
                                                          : "opacity-0"
                                                      )}
                                                    />
                                                    {test.name}
                                                  </CommandItem>
                                                ))}
                                              </CommandGroup>
                                            ))}
                                          </CommandList>
                                        </Command>
                                      </PopoverContent>
                                    </Popover>
                                    <FormControl>
                                      <input
                                        type="hidden"
                                        {...field}
                                        value={field.value || ""}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {selectedTest && parameters.length > 0 && (
                                <div className="space-y-4 pt-4 border-t">
                                  <FormLabel>Test Parameters</FormLabel>
                                  <div className="space-y-3">
                                    {parameters.map((param, paramIndex) => {
                                      const paramDef =
                                        selectedTest.parameters[paramIndex];

                                      // Get range based on patient gender
                                      let range: string;
                                      if (typeof paramDef.range === "string") {
                                        range = paramDef.range;
                                      } else {
                                        const patientGender =
                                          selectedPatient?.gender?.toLowerCase();
                                        if (
                                          patientGender &&
                                          paramDef.range[
                                            patientGender as keyof typeof paramDef.range
                                          ]
                                        ) {
                                          range = paramDef.range[
                                            patientGender as keyof typeof paramDef.range
                                          ] as string;
                                        } else {
                                          // Fallback to first available range value
                                          range = Object.values(
                                            paramDef.range
                                          )[0] as string;
                                        }
                                      }

                                      const hasFormula = !!paramDef.formula;
                                      const currentValue = form.watch(`tests.${index}.parameters.${paramIndex}.value`);
                                      const isCalculated = hasFormula && currentValue !== undefined && currentValue !== "";
                                      const paramKey = selectedTest ? `${selectedTest.id}-${param.name}` : `${index}-${paramIndex}`;
                                      const wasManuallyEdited = hasFormula && manuallyEditedParams.has(paramKey);

                                      return (
                                        <div
                                          key={paramIndex}
                                          className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 items-end"
                                        >
                                          <div>
                                            <div className="flex items-center gap-1">
                                              <FormLabel className="text-sm font-normal">
                                                {paramDef.name}
                                              </FormLabel>
                                              {hasFormula && (
                                                <TooltipProvider>
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 cursor-help hover:text-blue-700 dark:hover:text-blue-300 transition-colors" />
                                                    </TooltipTrigger>
                                                    <TooltipContent 
                                                      className="max-w-xs bg-popover border border-border shadow-lg"
                                                      sideOffset={5}
                                                    >
                                                      <div className="space-y-2 text-popover-foreground">
                                                        <p className="font-semibold text-sm">Calculated Parameter</p>
                                                        <p className="text-sm text-muted-foreground">
                                                          This value is calculated using the formula:
                                                        </p>
                                                        <p className="text-sm font-mono bg-muted dark:bg-muted/50 text-foreground p-2 rounded border border-border">
                                                          {paramDef.name} = {paramDef.formula}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                          You can modify this value if needed.
                                                        </p>
                                                      </div>
                                                    </TooltipContent>
                                                  </Tooltip>
                                                </TooltipProvider>
                                              )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                              Range: {range} {paramDef.unit}
                                            </p>
                                          </div>
                                          <FormField
                                            control={form.control}
                                            name={`tests.${index}.parameters.${paramIndex}.value`}
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormControl>
                                                  <TooltipProvider>
                                                    <Tooltip>
                                                      <TooltipTrigger asChild>
                                                        <div className="relative">
                                                          <Input
                                                            type="text"
                                                            placeholder="Value"
                                                            {...field}
                                                            value={
                                                              field.value !== undefined
                                                                ? String(field.value)
                                                                : ""
                                                            }
                                                              onChange={(e) => {
                                                                const value =
                                                                  e.target.value;
                                                                // Mark as manually edited if it's a formula parameter and user is typing
                                                                if (hasFormula && value !== "") {
                                                                  const paramKey = selectedTest ? `${selectedTest.id}-${param.name}` : `${index}-${paramIndex}`;
                                                                  setManuallyEditedParams(prev => new Set(prev).add(paramKey));
                                                                }
                                                                field.onChange(
                                                                  value === ""
                                                                    ? undefined
                                                                    : value
                                                                );
                                                                // Don't trigger auto-recalculation - only update via refresh icon
                                                              }}
                                                            className={isCalculated ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 pr-10" : ""}
                                                          />
                                                          {hasFormula && (
                                                            <Button
                                                              type="button"
                                                              variant="ghost"
                                                              size="sm"
                                                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                                              onClick={() => {
                                                                // Temporarily remove from manually edited set to allow recalculation
                                                                setManuallyEditedParams(prev => {
                                                                  const newSet = new Set(prev);
                                                                  newSet.delete(paramKey);
                                                                  return newSet;
                                                                });
                                                                
                                                                // Get current parameter values for calculation
                                                                const currentTests = form.getValues("tests");
                                                                const currentTest = currentTests[index];
                                                                if (!currentTest?.testId) return;
                                                                
                                                                const testData = testsData[currentTest.testId as keyof typeof testsData];
                                                                if (!testData) return;
                                                                
                                                                const currentParams = currentTest.parameters || [];
                                                                const paramValues: Record<string, number | string | undefined> = {};
                                                                
                                                                // Build map of parameter values
                                                                currentParams.forEach((p, idx) => {
                                                                  if (idx < testData.parameters.length) {
                                                                    const pDefName = testData.parameters[idx].name;
                                                                    if (p.value !== undefined && p.value !== null && p.value !== "") {
                                                                      const numValue = typeof p.value === "string" ? parseFloat(p.value) : p.value;
                                                                      if (!isNaN(numValue) && isFinite(numValue)) {
                                                                        paramValues[pDefName] = numValue;
                                                                        if (p.name !== pDefName) {
                                                                          paramValues[p.name] = numValue;
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                });
                                                                
                                                                // Calculate the new value
                                                                const calculatedValue = calculateFormula(paramDef.formula, paramValues);
                                                                
                                                                if (calculatedValue !== null) {
                                                                  const calculatedStr = String(calculatedValue);
                                                                  field.onChange(calculatedStr);
                                                                  // Mark as manually edited again so it won't auto-update
                                                                  setManuallyEditedParams(prev => new Set(prev).add(paramKey));
                                                                }
                                                              }}
                                                              title="Recalculate value from formula"
                                                            >
                                                              <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                            </Button>
                                                          )}
                                                        </div>
                                                      </TooltipTrigger>
                                                      {hasFormula && (
                                                        <TooltipContent 
                                                          className="max-w-xs bg-popover border border-border shadow-lg"
                                                          side="right"
                                                          sideOffset={10}
                                                          align="start"
                                                        >
                                                          <div className="space-y-2 text-popover-foreground">
                                                            <p className="font-semibold text-sm">Calculated Parameter</p>
                                                            <p className="text-sm text-muted-foreground">
                                                              This value is calculated using the formula:
                                                            </p>
                                                            <p className="text-sm font-mono bg-muted dark:bg-muted/50 text-foreground p-2 rounded border border-border">
                                                              {paramDef.name} = {paramDef.formula}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                              Click the refresh icon to recalculate.
                                                            </p>
                                                          </div>
                                                        </TooltipContent>
                                                      )}
                                                    </Tooltip>
                                                  </TooltipProvider>
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                          <div className="text-sm text-muted-foreground">
                                            {paramDef.unit}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            {range}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              <FormField
                                control={form.control}
                                name={`tests.${index}.comment`}
                                render={({ field }) => (
                                  <FormItem className="pt-4 border-t">
                                    <FormLabel>
                                      Test Comments (Optional)
                                    </FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Add comments for this test (optional)..."
                                        className="min-h-20"
                                        value={field.value || ""}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          field.onChange(
                                            value === "" || value.trim() === ""
                                              ? undefined
                                              : value
                                          );
                                        }}
                                        onBlur={field.onBlur}
                                        ref={field.ref}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Optional comments specific to this test
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset({
                      patientName: "",
                      patientAge: 0,
                      patientGender: "Male",
                      patientPhone: "",
                      patientEmail: "",
                      doctor: "Self",
                      title: "",
                      registeredDate: new Date(), // Will be updated when patient is selected
                      collectedDate: new Date(),
                      tests: [],
                    });
                    setSelectedPatient(null);
                    setTestPopovers({});
                    setOpenCards({});
                  }}
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  disabled={!selectedPatient || fields.length === 0}
                >
                  Create Report
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
