// TODO: Edge Function Supabase pour créer un PaymentIntent Stripe

export default async function handler(req: any, res: any) {
  // ...
  res.status(200).json({ clientSecret: "test_secret" });
}
