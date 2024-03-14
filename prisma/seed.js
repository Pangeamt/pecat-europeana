const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const generateSaltAndHash = ({ password }) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return { salt, hash };
};

async function main() {
  const adminData = {
    name: "Admin",
    email: "admin@pecat.com",
    password: "admin123",
  };
  const { salt, hash } = generateSaltAndHash({ password: adminData.password });

  const admin = await prisma.user.upsert({
    where: { email: "admin@pecat.com" },
    update: {},
    create: {
      name: adminData.name,
      email: adminData.email,
      role: "ADMIN",
      salt,
      hash,
    },
  });

  console.log({ admin });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
