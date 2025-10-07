import 'dotenv/config';
import { connectToDatabase, disconnectFromDatabase } from '../database/connection';
import { User } from '../models/User';

async function main() {
  try {
    await connectToDatabase();
    const users = await User.find().lean();
    console.log('Users:', users.map(u => ({ id: u._id.toString(), username: u.username, role: u.role })));

    const admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      console.log('Admin user not found');
    } else {
      // @ts-ignore comparePassword exists on doc
      const ok = await (admin as any).comparePassword('admin123');
      console.log('Admin role:', admin.role, 'Password matches:', ok);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await disconnectFromDatabase();
  }
}

main();


