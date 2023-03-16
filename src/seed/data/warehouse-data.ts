interface SeedStorage {
  name: string;
  // isActive: boolean;
}

type ValidSizes = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
type ValidTypes = 'shirts' | 'pants' | 'hoodies' | 'hats';

type ValidRoles = 'admin' | 'user' | 'delivery' | 'super-user';

interface SeedUser {
  email: string;
  fullName: string;
  password: string;
  roles: string;
  isActive: boolean;
}

interface SeedData {
  users: SeedUser[];
  storages: SeedStorage[];
}

export const initialData: SeedData = {
  users: [
    {
      email: 'test1@gmail.com',
      fullName: 'Test One',
      password: 'abc123',
      roles: '["admin"]',
      isActive: true,
    },
    {
      email: 'test2@gmail.com',
      fullName: 'Test Two',
      password: 'abc123',
      roles: '["user", "super-user"]',
      isActive: true,
    },
    {
      email: 'test3@gmail.com',
      fullName: 'Test Tree',
      password: 'abc123',
      roles: '["user"]',
      isActive: true,
    },
    {
      email: 'test4@gmail.com',
      fullName: 'Test Four',
      password: 'abc123',
      roles: '["user", "delivery"]',
      isActive: false,
    },
  ],

  storages: [
    { name: 'almacen_01' },
    { name: 'almacen_02' },
    { name: 'almacen_03' },
    { name: 'almacen_04' },
    { name: 'almacen_05' },
  ],
};
