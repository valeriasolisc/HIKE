import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetMicroproject, useApplyMicroproject } from "@workspace/api-client-react";
import { getGetMicroprojectQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowLeft, Building, Clock, Coins, Users, CheckCircle, Loader2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const applicationSchema = z.object({
  proposal: z.string().min(20, "Proposal must be at least 20 characters explaining why you're a good fit."),
});

export default function MicroprojectDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [hasApplied, setHasApplied] = useState(false);

  const { data: project, isLoading } = useGetMicroproject(id, {
    query: { enabled: !!id, queryKey: getGetMicroprojectQueryKey(id) as any }
  });

  const applyMutation = useApplyMicroproject();

  const form = useForm<z.infer<typeof applicationSchema>>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { proposal: "" },
  });

  const onSubmit = (data: z.infer<typeof applicationSchema>) => {
    applyMutation.mutate({ id, data }, {
      onSuccess: () => {
        toast.success("Application submitted successfully!");
        setHasApplied(true);
        queryClient.invalidateQueries({ queryKey: getGetMicroprojectQueryKey(id) as any });
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to apply");
      }
    });
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading details...</div>;
  if (!project) return <div className="p-8 text-center">Microproject not found.</div>;

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <Link href="/microprojects" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 w-4 h-4" /> Back to microprojects
      </Link>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm mb-8">
        <div className="bg-muted/30 p-8 border-b">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-primary font-medium">
              <Building className="w-5 h-5" />
              {project.companyName}
            </div>
            <Badge variant={project.difficulty === 'hard' ? 'destructive' : project.difficulty === 'medium' ? 'default' : 'secondary'} className="capitalize px-3 py-1">
              {project.difficulty}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6">{project.title}</h1>
          
          <div className="flex flex-wrap gap-6 text-sm font-medium text-muted-foreground">
            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {project.duration}</div>
            <div className="flex items-center gap-2"><Coins className="w-4 h-4 text-yellow-500" /> {project.rewardPoints} MÉRITO Points</div>
            <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {project.applicantCount} Applicants</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Status: <span className="capitalize text-foreground">{project.status}</span></div>
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold mb-4">Description</h2>
          <div className="prose prose-blue max-w-none dark:prose-invert mb-8 text-muted-foreground leading-relaxed whitespace-pre-line">
            {project.description}
          </div>

          <h2 className="text-xl font-bold mb-4">Required Skills</h2>
          <div className="flex flex-wrap gap-2 mb-8">
            {project.requiredSkills.map((skill, i) => (
              <span key={i} className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-semibold">
                {skill}
              </span>
            ))}
          </div>

          <div className="border-t pt-8 mt-4">
            {hasApplied ? (
              <div className="bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 p-6 rounded-xl border border-green-200 dark:border-green-900 flex flex-col items-center text-center">
                <CheckCircle className="w-12 h-12 mb-3" />
                <h3 className="text-xl font-bold mb-1">Application Submitted</h3>
                <p>Your proposal has been sent to {project.companyName}. We'll notify you if selected.</p>
              </div>
            ) : project.status === 'open' ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="proposal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg">Your Proposal</FormLabel>
                        <p className="text-sm text-muted-foreground mb-3">Explain why your competence and past projects make you the right fit for this challenge.</p>
                        <FormControl>
                          <Textarea 
                            placeholder="I am highly interested in this challenge because..." 
                            className="min-h-[150px] resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" size="lg" disabled={applyMutation.isPending} className="px-8">
                      {applyMutation.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                      Submit Application
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="bg-muted p-6 rounded-xl text-center">
                <h3 className="text-lg font-medium text-muted-foreground">This microproject is currently {project.status}.</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
