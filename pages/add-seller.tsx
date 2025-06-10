import { useForm } from "react-hook-form";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "../lib/firebase";

export default function AddSeller() {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const auth = getAuth(app);

      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;
      console.log("✅ تم إنشاء الحساب بنجاح. UID:", user.uid);

      // الخطوات القادمة: رفع الصورة + تخزين البيانات في Firestore
      alert("تم إنشاء حساب البائع بنجاح!");

      // تفريغ الفورم بعد الإرسال
      reset();

    } catch (error: any) {
      console.error("❌ خطأ في التسجيل:", error.message);
      alert("فشل في إنشاء الحساب: " + error.message);
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Ajouter un commerçant</h2>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 10 }}>

        <input placeholder="Nom du commerce" {...register("storeName")} required />
        <input placeholder="Adresse" {...register("address")} required />

        <select {...register("storeType")} required>
          <option value="">Type de commerce</option>
          <option value="resto_fastfood">Restaurant / Fast Food</option>
          <option value="boulangerie">Boulangerie / Pâtisserie</option>
          <option value="epicerie">Épicerie / Supérette</option>
          <option value="cafe">Café / Salon de thé</option>
          <option value="hotel">Hôtel</option>
          <option value="autre">Autre</option>
        </select>

        <input placeholder="Email" type="email" {...register("email")} required />
        <input placeholder="Mot de passe" type="password" {...register("password")} required />
        <input type="file" {...register("image")} required />

        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
}