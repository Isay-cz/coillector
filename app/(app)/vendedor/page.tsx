import { getProfile } from "@/lib/auth";

export default async function VendedorHome() {
  const perfil = await getProfile();
  return <h1 className="text-2xl font-bold">Hola, {perfil?.nombre}</h1>;
}
