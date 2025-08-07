// Create: phisnet/scripts/setup-roles.ts
import { db } from "../server/db";
import { eq } from "drizzle-orm";
import { rolesSchema, userRolesSchema, DEFAULT_ROLES } from "../shared/schema";

export async function setupDefaultRoles() {
  console.log('Setting up default roles...');
  
  try {
    // Insert default roles
    for (const roleData of DEFAULT_ROLES) {
      const existingRole = await db.select()
        .from(rolesSchema)
        .where(eq(rolesSchema.name, roleData.name))
        .limit(1);
      
      if (existingRole.length === 0) {
        await db.insert(rolesSchema).values({
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions,
        });
        console.log(`Created role: ${roleData.name}`);
      }
    }
    
    console.log('Default roles setup completed');
  } catch (error) {
    console.error('Error setting up roles:', error);
  }
}

// Run this script
setupDefaultRoles();