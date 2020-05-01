# Migration `20200501090619`

This migration has been generated by Lukas Jakob at 5/1/2020, 9:06:19 AM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
DROP INDEX `User.email` ON `nestjsrealworld-prisma`.`User`
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration 20200501090445..20200501090619
--- datamodel.dml
+++ datamodel.dml
@@ -3,14 +3,14 @@
 }
 datasource db {
   provider = "mysql"
-  url = "***"
+  url      = env("DATABASE_URL")
 }
 model User {
   bio       String?
-  email     String  @unique
+  email     String  
   id        Int     @default(autoincrement()) @id
   image     String?
   password  String?
   username  String? @unique
```

