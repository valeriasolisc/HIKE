import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  name: z.string().min(2, { message: "El nombre es requerido" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  role: z.enum(["student", "recruiter"]),
});

export default function Register() {
  const registerMutation = useRegister();
  const { setAuth } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const isRecruiter = location.includes("role=recruiter");

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      name: "", 
      email: "", 
      password: "", 
      role: isRecruiter ? "recruiter" : "student" 
    },
  });

  const onSubmit = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(
      { data },
      {
        onSuccess: (res) => {
          setAuth(res.user, res.token);
          toast({ title: "Registro exitoso", description: "Cuenta creada correctamente" });
          setLocation("/onboarding");
        },
        onError: () => {
          toast({ title: "Error", description: "No se pudo crear la cuenta", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Crear Cuenta</CardTitle>
          <CardDescription>Únete a HIKE y potencia tu talento</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soy</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="student">Estudiante / Talento</SelectItem>
                        <SelectItem value="recruiter">Reclutador / Empresa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Pérez" {...field} />
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
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="tu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? "Creando cuenta..." : "Registrarme"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Inicia sesión aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
