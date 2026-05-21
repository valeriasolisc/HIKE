import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useListSkills, useAddSkill, useDeleteSkill } from "@workspace/api-client-react";
import { getListSkillsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Plus, Code, Users, Wrench, Languages, Loader2 } from "lucide-react";
import { SkillInputCategory, SkillInputLevel } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Skills() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState<SkillInputCategory>("technical");
  const [newSkillLevel, setNewSkillLevel] = useState<SkillInputLevel>("intermediate");

  const { data: skills, isLoading } = useListSkills(
    { userId: user?.id },
    { query: { enabled: !!user, queryKey: getListSkillsQueryKey({ userId: user?.id }) as any } }
  );

  const addSkill = useAddSkill();
  const deleteSkill = useDeleteSkill();

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    addSkill.mutate({ 
      data: { 
        name: newSkillName.trim(), 
        category: newSkillCategory, 
        level: newSkillLevel 
      } 
    }, {
      onSuccess: () => {
        toast.success("Skill added successfully");
        setNewSkillName("");
        queryClient.invalidateQueries({ queryKey: getListSkillsQueryKey({ userId: user?.id }) as any });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      },
      onError: (err: any) => toast.error(err.message || "Failed to add skill")
    });
  };

  const handleDelete = (id: number) => {
    deleteSkill.mutate({ id }, {
      onSuccess: () => {
        toast.success("Skill removed");
        queryClient.invalidateQueries({ queryKey: getListSkillsQueryKey({ userId: user?.id }) as any });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      },
      onError: (err: any) => toast.error(err.message || "Failed to remove skill")
    });
  };

  const categories = [
    { id: "technical", label: "Technical", icon: Code, color: "bg-blue-500/10 text-blue-600 border-blue-200" },
    { id: "soft", label: "Soft Skill", icon: Users, color: "bg-green-500/10 text-green-600 border-green-200" },
    { id: "tool", label: "Tool", icon: Wrench, color: "bg-orange-500/10 text-orange-600 border-orange-200" },
    { id: "language", label: "Language", icon: Languages, color: "bg-purple-500/10 text-purple-600 border-purple-200" }
  ];

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skills Inventory</h1>
        <p className="text-muted-foreground">Manage your competencies. Validations from peers will boost your score.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Skill</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSkill} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="text-sm font-medium">Skill Name</label>
              <Input 
                placeholder="e.g. React, Leadership, Figma, English" 
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48 space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={newSkillCategory} onValueChange={(v: any) => setNewSkillCategory(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="soft">Soft Skill</SelectItem>
                  <SelectItem value="tool">Tool</SelectItem>
                  <SelectItem value="language">Language</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48 space-y-2">
              <label className="text-sm font-medium">Level</label>
              <Select value={newSkillLevel} onValueChange={(v: any) => setNewSkillLevel(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={addSkill.isPending || !newSkillName.trim()} className="w-full md:w-auto h-10 px-8">
              {addSkill.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {categories.map(cat => {
          const CatIcon = cat.icon;
          const catSkills = skills?.filter(s => s.category === cat.id) || [];
          
          return (
            <Card key={cat.id} className="overflow-hidden">
              <div className={`p-4 border-b flex items-center gap-3 ${cat.color.replace('border-', 'bg-muted/50 border-')}`}>
                <CatIcon className="w-5 h-5" />
                <h3 className="font-semibold text-lg">{cat.label}</h3>
                <Badge variant="secondary" className="ml-auto">{catSkills.length}</Badge>
              </div>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                ) : catSkills.length > 0 ? (
                  <ul className="divide-y">
                    {catSkills.map(skill => (
                      <li key={skill.id} className="p-4 flex items-center justify-between group hover:bg-muted/30 transition-colors">
                        <div>
                          <p className="font-medium">{skill.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{skill.level}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
                          onClick={() => handleDelete(skill.id)}
                          disabled={deleteSkill.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No {cat.label.toLowerCase()}s added yet.
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
