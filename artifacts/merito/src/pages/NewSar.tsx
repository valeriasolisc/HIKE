import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateSarExperience } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Target, Zap, TrendingUp, CheckCircle, X } from "lucide-react";
import { Link } from "wouter";

const sarSchema = z.object({
  situacion: z.string().min(10, "Must be at least 10 characters"),
  accion: z.string().min(10, "Must be at least 10 characters"),
  resultado: z.string().min(10, "Must be at least 10 characters"),
  softSkills: z.array(z.string()).min(1, "At least one soft skill is required"),
  context: z.string().optional(),
});

type SarFormValues = z.infer<typeof sarSchema>;

export default function NewSar() {
  const [, setLocation] = useLocation();
  const createSar = useCreateSarExperience();
  const queryClient = useQueryClient();
  const [skillInput, setSkillInput] = useState("");
  const [step, setStep] = useState(1);
  
  const form = useForm<SarFormValues>({
    resolver: zodResolver(sarSchema),
    defaultValues: {
      situacion: "",
      accion: "",
      resultado: "",
      softSkills: [],
      context: "",
    },
  });

  const onSubmit = (data: SarFormValues) => {
    createSar.mutate({ data }, {
      onSuccess: () => {
        toast.success("SAR Experience saved successfully!");
        queryClient.invalidateQueries({ queryKey: ["/api/sar-experiences"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        setLocation("/sar");
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to save experience");
      }
    });
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    const currentSkills = form.getValues("softSkills");
    if (!currentSkills.includes(skillInput.trim())) {
      form.setValue("softSkills", [...currentSkills, skillInput.trim()], { shouldValidate: true });
    }
    setSkillInput("");
  };

  const nextStep = async () => {
    const fieldsToValidate = 
      step === 1 ? ["situacion"] as const : 
      step === 2 ? ["accion"] as const : 
      ["resultado", "softSkills"] as const;
      
    const isStepValid = await form.trigger(fieldsToValidate);
    if (isStepValid) setStep(prev => Math.min(prev + 1, 3));
  };

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/sar" className="p-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New SAR Experience</h1>
          <p className="text-muted-foreground">A guided way to document your behavioral achievements.</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -z-10 -translate-y-1/2 rounded-full" />
        <div className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-300" style={{ width: `${(step - 1) * 50}%` }} />
        
        {[
          { num: 1, icon: Target, label: "Situation" },
          { num: 2, icon: Zap, label: "Action" },
          { num: 3, icon: TrendingUp, label: "Result" }
        ].map(s => (
          <div key={s.num} className="flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
              step >= s.num ? "bg-primary border-primary text-primary-foreground" : "bg-card border-muted text-muted-foreground"
            }`}>
              <s.icon className="w-5 h-5" />
            </div>
            <span className={`text-xs font-semibold ${step >= s.num ? "text-primary" : "text-muted-foreground"}`}>{s.label}</span>
          </div>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card border p-8 rounded-2xl shadow-sm">
          
          <div className={step === 1 ? "block" : "hidden"}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-primary"><Target className="w-6 h-6" /> Situation</h2>
              <p className="text-muted-foreground">Describe the context within which you performed a job or faced a challenge at work.</p>
            </div>
            <FormField
              control={form.control}
              name="situacion"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., During my internship at TechCorp, our main database was experiencing severe latency issues during peak hours, causing downtime for users..." 
                      className="min-h-[200px] text-base resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end mt-8">
              <Button type="button" size="lg" onClick={nextStep}>Next: Action <ArrowLeft className="w-4 h-4 ml-2 rotate-180" /></Button>
            </div>
          </div>

          <div className={step === 2 ? "block" : "hidden"}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-primary"><Zap className="w-6 h-6" /> Action</h2>
              <p className="text-muted-foreground">Describe how you completed the task or endeavored to meet the challenge. Focus on what *you* did.</p>
            </div>
            <FormField
              control={form.control}
              name="accion"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., I initiated an audit of the query logs to identify bottlenecks. I then optimized the top 5 most expensive queries by adding appropriate indices and implemented a Redis caching layer for frequent read-heavy requests..." 
                      className="min-h-[200px] text-base resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between mt-8">
              <Button variant="outline" type="button" onClick={() => setStep(1)}>Back</Button>
              <Button type="button" size="lg" onClick={nextStep}>Next: Result <ArrowLeft className="w-4 h-4 ml-2 rotate-180" /></Button>
            </div>
          </div>

          <div className={step === 3 ? "block" : "hidden"}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-primary"><TrendingUp className="w-6 h-6" /> Result</h2>
              <p className="text-muted-foreground">Explain the outcomes or results generated by the action taken. Emphasize what you accomplished or learned.</p>
            </div>
            <FormField
              control={form.control}
              name="resultado"
              render={({ field }) => (
                <FormItem className="mb-8">
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., The latency was reduced by 75% during peak hours, and overall application load time improved by 2 seconds. The caching strategy was adopted as a standard practice for all future microservices..." 
                      className="min-h-[150px] text-base resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-6 border-t">
              <FormField
                control={form.control}
                name="softSkills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">What soft skills did this demonstrate?</FormLabel>
                    <div className="flex gap-2 mt-2">
                      <Input 
                        placeholder="E.g. Problem Solving, Leadership..." 
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                      />
                      <Button type="button" onClick={addSkill} variant="secondary">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {field.value.map((skill, index) => (
                        <div key={index} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                          {skill}
                          <button
                            type="button"
                            onClick={() => {
                              const newSkills = [...field.value];
                              newSkills.splice(index, 1);
                              form.setValue("softSkills", newSkills, { shouldValidate: true });
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

            <div className="flex justify-between mt-8">
              <Button variant="outline" type="button" onClick={() => setStep(2)}>Back</Button>
              <Button type="submit" size="lg" disabled={createSar.isPending} className="px-8">
                {createSar.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                Publish SAR
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
