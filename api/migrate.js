import { list, put } from '@vercel/blob';

// Migration script to seed Blob storage with initial data
// Run once by POST to /api/migrate with the admin password

const initialData = {
  offices: [
    { name: "Northridge", address: "8628 Reseda Blvd, Northridge, CA 91324", lat: 34.227, lng: -118.536 },
    { name: "West Hills", address: "7345 Medical Center Dr, West Hills, CA 91307", lat: 34.202, lng: -118.63 },
    { name: "Pasadena", address: "504 S Sierra Madre Blvd, Pasadena, CA 91107", lat: 34.144, lng: -118.102 },
    { name: "Van Nuys", address: "14426 Gilmore St, Van Nuys, CA 91401", lat: 34.188, lng: -118.447 },
    { name: "San Fernando", address: "777 Truman St., San Fernando, CA 91340", lat: 34.282, lng: -118.439 },
    { name: "Agoura Hills", address: "5115 Clareton Dr, Agoura Hills, CA 91301", lat: 34.146, lng: -118.754 },
    { name: "La Canada", address: "1021 Foothill Blvd, La Canada Flintridge, CA 91011", lat: 34.205, lng: -118.201 },
    { name: "Whittier", address: "13470 Telegraph Rd, Whittier, CA 90605", lat: 33.939, lng: -118.044 },
    { name: "Beverly Hills", address: "8733 Beverly Blvd, West Hollywood, CA 90048", lat: 34.077, lng: -118.382 },
    { name: "Glendale", address: "1530 E Chevy Chase Dr, Glendale, CA 91206", lat: 34.152, lng: -118.231 },
    { name: "Canyon Country", address: "20655 Soledad Canyon Rd, Canyon Country, CA 91351", lat: 34.416, lng: -118.469 },
    { name: "Culver City", address: "3831 Hughes Ave, Culver City, CA 90232", lat: 34.023, lng: -118.398 },
    { name: "Valencia", address: "24330 McBean Pkwy, Valencia, CA 91355", lat: 34.404, lng: -118.553 },
    { name: "Torrance", address: "3524 Torrance Blvd, Torrance, CA 90503", lat: 33.836, lng: -118.347 },
    { name: "Mission Hills", address: "10200 Sepulveda Blvd, Mission Hills, CA 91345", lat: 34.256, lng: -118.467 },
    { name: "Pico Rivera", address: "8337 Telegraph Rd, Pico Rivera, CA 90660", lat: 33.964, lng: -118.113 },
    { name: "Arcadia", address: "16 E Huntington Dr, Arcadia, CA 91006", lat: 34.14, lng: -118.031 },
    { name: "Santa Monica", address: "2221 Lincoln Blvd, Santa Monica, CA 90404", lat: 34.016, lng: -118.487 },
    { name: "Downey", address: "8021 4th Street, Downey, CA 90241", lat: 33.946, lng: -118.135 },
    { name: "Tarzana", address: "18372 Clark St, Tarzana, CA 91356", lat: 34.17, lng: -118.533 },
    { name: "Hollywood", address: "5255 Sunset Blvd, Los Angeles, CA 90027", lat: 34.098, lng: -118.305 },
    { name: "La Mirada", address: "12675 La Mirada Blvd, La Mirada, CA 90638", lat: 33.916, lng: -118.012 }
  ],
  providers: [
    { name: "Adrienne Altman", lat: 34.163, lng: -118.461 },
    { name: "Fatima Anari", lat: 34.299, lng: -118.584 },
    { name: "Anwar Arastu", lat: 33.967, lng: -117.982 },
    { name: "Vaseema Arastu", lat: 33.967, lng: -117.982 },
    { name: "Behroozan Benjamin", lat: 34.064, lng: -118.397 },
    { name: "Hilma Benjamin", lat: 34.199, lng: -118.66 },
    { name: "Jasmine Berookim", lat: 34.072, lng: -118.458 },
    { name: "Brian Bhatt", lat: 34.19, lng: -118.591 },
    { name: "Emily Brandt", lat: 34.144, lng: -118.237 },
    { name: "Cecilio Victor Cay", lat: 34.15, lng: -118.26 },
    { name: "Jenifer Chungafung", lat: 33.992, lng: -117.886 },
    { name: "Tyler Clark", lat: 34.172, lng: -118.39 },
    { name: "Monique Craig", lat: 33.959, lng: -118.323 },
    { name: "Mario Cuevas", lat: 33.99, lng: -117.73 },
    { name: "Jene Cyin", lat: 33.849, lng: -117.782 },
    { name: "Madelaine Dolukhanyan", lat: 34.213, lng: -118.337 },
    { name: "Amrita Dosanjh", lat: 32.845, lng: -117.275 },
    { name: "Alejandra Duarte", lat: 33.961, lng: -118.014 },
    { name: "Martin Fineberg", lat: 34.045, lng: -118.471 },
    { name: "Lousine Frandjian", lat: 34.146, lng: -118.167 },
    { name: "Rohina Furmuly", lat: 34.272, lng: -118.886 },
    { name: "Ruth Gabay", lat: 34.046, lng: -118.378 },
    { name: "Katherine Galos", lat: 34.289, lng: -118.561 },
    { name: "Araksi Garadzhyan", lat: 34.174, lng: -118.281 },
    { name: "Luis Garcia", lat: 33.917, lng: -118.185 },
    { name: "Tatiana Genjoyan", lat: 34.25, lng: -118.275 },
    { name: "Clarissa Gooze", lat: 34.214, lng: -118.641 },
    { name: "Molly Grigorian", lat: 34.216, lng: -118.234 },
    { name: "Lisa Gutierrez", lat: 34.2, lng: -118.222 },
    { name: "Roobina Hakoopian", lat: 34.24, lng: -118.547 },
    { name: "Delaram Halavi", lat: 34.074, lng: -118.392 },
    { name: "David Hantman", lat: 34.027, lng: -118.514 },
    { name: "Faiza Iram", lat: 33.874, lng: -117.829 },
    { name: "Azam Jazayeri", lat: 34.125, lng: -118.445 },
    { name: "Laurie Juarez Morales", lat: 34.257, lng: -118.307 },
    { name: "Rena Keynigshteyn", lat: 34.168, lng: -118.527 },
    { name: "Breanna Kikuchi", lat: 33.822, lng: -118.342 },
    { name: "Yeongbu Kim", lat: 34.062, lng: -118.327 },
    { name: "Sylvia Lam", lat: 34.098, lng: -118.113 },
    { name: "Erika Lee", lat: 34.145, lng: -118.128 },
    { name: "Casie McGuire", lat: 34.388, lng: -118.598 },
    { name: "Savannah Michels", lat: 33.845, lng: -118.391 },
    { name: "Victoria Millet", lat: 34.175, lng: -118.606 },
    { name: "Narindar Nat", lat: 34.241, lng: -118.618 },
    { name: "Mealynne Ngu", lat: 34.02, lng: -118.405 },
    { name: "Ernestine Njie", lat: 34.066, lng: -118.35 },
    { name: "Sonal Patel", lat: 34.18, lng: -118.206 },
    { name: "Cecilia Patino", lat: 34.181, lng: -118.523 },
    { name: "Helen Pensanti", lat: 33.651, lng: -117.579 },
    { name: "Oliver Petalver", lat: 33.974, lng: -117.543 },
    { name: "Tisha Pison", lat: 33.869, lng: -118.05 },
    { name: "Sharmetha Ramanan", lat: 34.091, lng: -118.336 },
    { name: "David Razi", lat: 34.071, lng: -118.398 },
    { name: "Trish Reyes", lat: 34.29, lng: -119.15 },
    { name: "Barbara Rodriguez", lat: 34.134, lng: -118.132 },
    { name: "Erik Saenz", lat: 33.974, lng: -118.03 },
    { name: "Yussef Sakhai MD Inc", lat: 34.099, lng: -118.459 },
    { name: "Banpreet Samra", lat: 34.205, lng: -118.559 },
    { name: "Christine Sapinoso", lat: 34.407, lng: -118.443 },
    { name: "Ahoo Sharif", lat: 34.044, lng: -118.462 },
    { name: "Palak Shelat", lat: 34.191, lng: -118.591 },
    { name: "Leore Slavick", lat: 34.066, lng: -118.387 },
    { name: "Mark Snyder", lat: 34.178, lng: -118.779 },
    { name: "Alea Sohn", lat: 33.894, lng: -118.415 },
    { name: "Miguel Sutter", lat: 34.161, lng: -118.334 },
    { name: "Cze-Ja Tam", lat: 34.158, lng: -118.445 },
    { name: "Victor Tamashiro", lat: 33.984, lng: -118.454 },
    { name: "Lisa Tan", lat: 34.073, lng: -118.217 },
    { name: "Carolina Ungs", lat: 34.019, lng: -118.109 },
    { name: "Jose Vargas", lat: 34.177, lng: -118.393 },
    { name: "Maria Vega", lat: 33.953, lng: -118.143 },
    { name: "Mary Wang", lat: 34.056, lng: -118.118 },
    { name: "Joanna Wu", lat: 34.088, lng: -118.075 },
    { name: "Jocelyn Zuniga", lat: 34.104, lng: -118.077 },
    { name: "Lucy Dushikyan", lat: 34.204, lng: -118.441 },
    { name: "Astghik Margaryan", lat: 34.185, lng: -118.429 },
    { name: "Alexander Davis", lat: 34.173, lng: -118.457 }
  ],
  staff: [
    { name: "Luz Garcia Lopez", lat: 34.561, lng: -118.093 },
    { name: "Gersy Torres", lat: 34.685, lng: -118.116 },
    { name: "Star Torres", lat: 34.685, lng: -118.116 },
    { name: "Aruna S Sidath Kumar", lat: 34.144, lng: -117.911 },
    { name: "Teresa Perez", lat: 33.933, lng: -118.162 },
    { name: "Claudia Graciano", lat: 34.048, lng: -117.74 },
    { name: "Perla Macias", lat: 33.918, lng: -118.145 },
    { name: "Marilyn Martinez", lat: 33.881, lng: -118.15 },
    { name: "Margarit Mkrtchyan", lat: 34.2, lng: -118.409 },
    { name: "Alondra Reyes", lat: 34.053, lng: -118.352 },
    { name: "Jose Vasquez", lat: 33.974, lng: -118.133 },
    { name: "Bania Hernandez", lat: 34.56, lng: -118.169 },
    { name: "Janet Aragon", lat: 33.957, lng: -118.359 },
    { name: "Adriana Gutierrez", lat: 34.094, lng: -117.979 },
    { name: "Danette Franquez", lat: 34.098, lng: -118.232 },
    { name: "Angelu Grande", lat: 34.19, lng: -118.395 },
    { name: "Jessica Gonzales", lat: 34.6, lng: -118.16 },
    { name: "Diana Ou", lat: 34.101, lng: -118.314 },
    { name: "Danielle De La Cruz", lat: 34.01, lng: -118.136 },
    { name: "Maribel Salcedo Ochoa", lat: 34.269, lng: -118.416 },
    { name: "Kimberly Fuentes", lat: 34.574, lng: -118.135 },
    { name: "Alondra Catalan Robles", lat: 33.982, lng: -118.326 },
    { name: "Hospicia Santiago", lat: 33.897, lng: -118.34 },
    { name: "Amir Hossein Bakhshian", lat: 33.666, lng: -117.79 },
    { name: "Leticia Martinez A", lat: 34.048, lng: -118.191 },
    { name: "Fariba Aghachi", lat: 34.156, lng: -118.53 },
    { name: "Yajaira Salvador Marquez", lat: 34.201, lng: -118.446 },
    { name: "Kim Whitaker-Stuart", lat: 33.919, lng: -118.275 },
    { name: "Karen Gracias", lat: 33.95, lng: -118.183 },
    { name: "Kinnari Patel", lat: 33.896, lng: -118.007 },
    { name: "Brian Estrada Ledezma", lat: 34.037, lng: -118.36 },
    { name: "Jose Sanchez", lat: 33.767, lng: -118.194 },
    { name: "Monessa Azad", lat: 33.903, lng: -117.488 },
    { name: "Anna Martikyan", lat: 34.182, lng: -118.295 },
    { name: "Veronica Cossu", lat: 34.147, lng: -118.105 },
    { name: "Rubina Tahmazyan", lat: 34.207, lng: -118.347 },
    { name: "Kristen Arredondo", lat: 33.771, lng: -118.26 },
    { name: "Daniela Lemus Romero", lat: 34.053, lng: -118.272 },
    { name: "Yvonne Carvajal", lat: 33.929, lng: -118.018 },
    { name: "Mindy Dantos", lat: 33.917, lng: -118.033 },
    { name: "Alexa Martinez", lat: 33.899, lng: -117.874 },
    { name: "Sheila Quinto", lat: 33.938, lng: -118.044 },
    { name: "Ana Ramos", lat: 33.834, lng: -117.903 },
    { name: "Miriam Solis", lat: 34.082, lng: -118.286 },
    { name: "Juliza Munoz", lat: 34.566, lng: -118.095 },
    { name: "Irma Ramirez", lat: 34.184, lng: -118.377 },
    { name: "Karina Ledezma", lat: 34.32, lng: -118.402 },
    { name: "Natalie Lopez", lat: 33.989, lng: -118.094 },
    { name: "Angelica Gutierrez", lat: 34.222, lng: -118.249 },
    { name: "Karina Escobedo", lat: 34.196, lng: -118.6 },
    { name: "Janesri De Silva", lat: 34.156, lng: -118.172 },
    { name: "Jacqueline Cortez", lat: 34.175, lng: -118.14 },
    { name: "Nancy Cruz", lat: 34.014, lng: -117.93 },
    { name: "Ignacia Lewis", lat: 34.144, lng: -118.102 },
    { name: "William Struve", lat: 34.256, lng: -118.522 },
    { name: "Norma Esparza", lat: 34.197, lng: -118.422 },
    { name: "Joshua Clarke", lat: 34.194, lng: -118.6 },
    { name: "Nancy Galvez", lat: 34.218, lng: -118.602 },
    { name: "Jessica Gonzalez", lat: 34.209, lng: -118.45 },
    { name: "Alyssa Silva", lat: 34.206, lng: -118.541 },
    { name: "Britney Perez", lat: 34.217, lng: -118.523 },
    { name: "Millie Mendez", lat: 34.275, lng: -118.41 },
    { name: "Genesis Pineda", lat: 34.209, lng: -118.458 },
    { name: "Joshua Poura", lat: 34.161, lng: -118.785 },
    { name: "Ashley Ruelas", lat: 34.242, lng: -118.413 },
    { name: "Samantha Pacheco", lat: 34.144, lng: -118.247 },
    { name: "Andrea Lira", lat: 34.195, lng: -118.422 },
    { name: "Jessica Ayala", lat: 34.145, lng: -118.1 },
    { name: "Maria Jara Mendez", lat: 34.175, lng: -118.533 },
    { name: "Kassandra Maldonado", lat: 34.201, lng: -118.547 },
    { name: "Angelica Norato", lat: 34.255, lng: -118.419 },
    { name: "Rebecca Reyes", lat: 34.201, lng: -118.565 },
    { name: "Jasmine Moreno", lat: 33.936, lng: -118.045 },
    { name: "Valeria Villaran", lat: 34.364, lng: -118.546 },
    { name: "Evet Ramirez", lat: 34.106, lng: -118.196 },
    { name: "Dawn Densmore", lat: 34.389, lng: -118.568 },
    { name: "Eduardo Medina-Vasquez", lat: 34.202, lng: -118.623 }
  ]
};

export default async function handler(req, res) {
  // Only allow POST with admin password
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const providedPassword = req.headers['x-admin-password'];

  if (!adminPassword || providedPassword !== adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Check if data already exists
    const { blobs } = await list({ prefix: 'data.json' });

    if (blobs.length > 0) {
      const response = await fetch(blobs[0].url);
      const existingData = await response.json();

      const hasData = existingData.providers?.length > 0 ||
                      existingData.staff?.length > 0 ||
                      existingData.offices?.length > 0;

      if (hasData) {
        return res.status(200).json({
          success: false,
          message: 'Data already exists. Delete the blob first to re-migrate.',
          counts: {
            providers: existingData.providers?.length || 0,
            staff: existingData.staff?.length || 0,
            offices: existingData.offices?.length || 0
          }
        });
      }
    }

    // Save initial data
    await put('data.json', JSON.stringify(initialData, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json'
    });

    return res.status(200).json({
      success: true,
      message: 'Migration complete',
      counts: {
        providers: initialData.providers.length,
        staff: initialData.staff.length,
        offices: initialData.offices.length
      }
    });
  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({ error: 'Migration failed', details: error.message });
  }
}
