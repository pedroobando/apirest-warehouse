interface SeedBase {
  name: string;
  // isActive: boolean;
}

// type ValidSizes = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
// type ValidTypes = 'shirts' | 'pants' | 'hoodies' | 'hats';

// type ValidRoles = 'admin' | 'user' | 'delivery' | 'super-user';

interface SeedUser {
  email: string;
  fullName: string;
  password: string;
  roles: string;
  isActive: boolean;
}

interface SeedData {
  users: SeedUser[];
  storages: SeedBase[];
  endsites: SeedBase[];
  categories: SeedBase[];
}

export const initialData: SeedData = {
  users: [
    {
      email: 'root@gmail.com',
      fullName: 'Root User',
      password: 'Abc123',
      roles: '["admin","super-user"]',
      isActive: true,
    },
    {
      email: 'user1@gmail.com',
      fullName: 'Test One',
      password: 'Abc123',
      roles: '["admin"]',
      isActive: true,
    },
    {
      email: 'user2@gmail.com',
      fullName: 'Test Two',
      password: 'Abc123',
      roles: '["user", "super-user"]',
      isActive: true,
    },
    {
      email: 'user3@gmail.com',
      fullName: 'Test Tree',
      password: 'Abc123',
      roles: '["user"]',
      isActive: false,
    },
    {
      email: 'user4@gmail.com',
      fullName: 'Test Four',
      password: 'Abc123',
      roles: '["user", "delivery"]',
      isActive: true,
    },
  ],

  storages: [
    { name: 'almacen_01' },
    { name: 'almacen_02' },
    { name: 'almacen_03' },
    { name: 'almacen_04' },
    { name: 'almacen_05' },
  ],

  endsites: [
    { name: 'sitio_01' },
    { name: 'sitio_02' },
    { name: 'sitio_03' },
    { name: 'sitio_04' },
  ],

  categories: [
    { name: 'category_1' },
    { name: 'category_2' },
    { name: 'category_3' },
    { name: 'category_4' },
  ],
};
