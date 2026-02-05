// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";
// import { getAuthUser } from "@/lib/get-auth-user";
// import { requireRole } from "@/lib/role-guard";
// import { calculateGST } from "@/lib/tax";

// export async function POST(req: Request) {
//   const user = await getAuthUser();
//   requireRole(user.role, ["ADMIN", "STAFF"]);

//   const {
//     customerId,
//     paymentMethod,
//   } = await req.json();

//   return prisma.$transaction(async (tx) => {
//     const cartItems = await tx.cartItem.findMany({
//       where: { userId: user.userId },
//       include: { product: true },
//     });

//     if (cartItems.length === 0) {
//       return NextResponse.json(
//         { message: "Cart empty" },
//         { status: 400 }
//       );
//     }

//     const totalAmount = cartItems.reduce(
//       (sum, i) => sum + i.product.price * i.quantity,
//       0
//     );

//     const tax = calculateGST(totalAmount);

//     const bill = await tx.bill.create({
//       data: {
//         totalAmount,
//         taxableAmount: tax.taxableAmount,
//         cgst: tax.cgst,
//         sgst: tax.sgst,
//         igst: tax.igst,
//         paymentMethod,
//         customerId: customerId ?? null,
//       },
//     });

//     for (const item of cartItems) {
//       await tx.billItem.create({
//         data: {
//           billId: bill.id,
//           productId: item.productId,
//           quantity: item.quantity,
//           price: item.product.price,
//         },
//       });

//       await tx.product.update({
//         where: { id: item.productId },
//         data: {
//           stock: { decrement: item.quantity },
//         },
//       });
//     }

//     await tx.cartItem.deleteMany({
//       where: { userId: user.userId },
//     });

//     return NextResponse.json(
//       { message: "Bill created", billId: bill.id },
//       { status: 201 }
//     );
//   });
// }
