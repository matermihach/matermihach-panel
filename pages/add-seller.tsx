import { useForm } from "react-hook-form";

export default function AddSeller() {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    console.log("Form data:", data);
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Ajouter un commerçant</h2>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 10 }}>

        <input placeholder="Nom du commerce" {...register("storeName")} />

        <input placeholder="Adresse" {...register("address")} />

        <select {...register("storeType")}>
          <option value="">Type de commerce</option>
          <option value="resto_fastfood">Restaurant / Fast Food</option>
          <option value="boulangerie">Boulangerie / Pâtisserie</option>
          <option value="epicerie">Épicerie / Supérette</option>
          <option value="cafe">Café / Salon de thé</option>
          <option value="hotel">Hôtel</option>
          <option value="autre">Autre</option>
        </select>

        <input placeholder="Email" type="email" {...register("email")} />

        <input placeholder="Mot de passe" type="password" {...register("password")} />

        <input type="file" {...register("image")} />

        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
}