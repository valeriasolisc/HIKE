import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateProject } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import { Link } from "wouter";

const projectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  problem: z.string().min(10, "Problem statement is required"),
  solution: z.string().min(10, "Solution statement is required"),
  impact: z.string().min(5, "Impact statement is required"),
  role: z.string().min(2, "Role is required"),
  technologies: z.array(z.string()).min(1, "At least one technology is required"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  demoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function NewProject() {
  const [, setLocation] = useLocation();
  const createProject = useCreateProject();
  const queryClient = useQueryClient();
  const [techInput, setTechInput] = useState("");
  
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      problem: "",
      solution: "",
      impact: "",
      role: "",
      technologies: [],
      imageUrl: "",
      githubUrl: "",
      demoUrl: "",
    },
  });

  const onSubmit = (data: ProjectFormValues) => {
    createProject.mutate({ data }, {
      onSuccess: () => {
        toast.success("Project created successfully!");
        queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        setLocation("/projects");
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to create project");
      }
    });
  };

  const addTech = () => {
    if (!techInput.trim()) return;
    const currentTechs = form.getValues("technologies");
    if (!currentTechs.includes(techInput.trim())) {
      form.setValue("technologies", [...currentTechs, techInput.trim()], { shouldValidate: true });
    }
    setTechInput("");
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/projects" className="p-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Project</h1>
          <p className="text-muted-foreground">Document your work with an evidence-based approach.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-card border rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g. E-commerce Payment Gateway" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A brief summary of what the project is about..." className="resize-none h-20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Role</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g. Lead Frontend Developer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="technologies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technologies Used</FormLabel>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="E.g. React" 
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTech();
                        }
                      }}
                    />
                    <Button type="button" onClick={addTech} variant="secondary">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {field.value.map((tech, index) => (
                      <div key={index} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                        {tech}
                        <button
                          type="button"
                          onClick={() => {
                            const newTechs = [...field.value];
                            newTechs.splice(index, 1);
                            form.setValue("technologies", newTechs, { shouldValidate: true });
                          }}
                          className="hover:text-destructive transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="bg-card border rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold">Evidence & Narrative</h2>
            
            <FormField
              control={form.control}
              name="problem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>The Problem</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What was the challenge or problem you set out to solve?" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="solution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>The Solution</FormLabel>
                  <FormControl>
                    <Textarea placeholder="How did you solve it? What approach did you take?" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="impact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>The Impact</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What was the result? Include metrics if possible." className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="bg-card border rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold">Links & Media (Optional)</h2>
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="githubUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repository URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="demoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Live Demo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/projects">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit" disabled={createProject.isPending} className="px-8">
              {createProject.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Publish Project
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
