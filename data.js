const offices = [
    { name: "Northridge", address: "8628 Reseda Blvd, Northridge, CA 91324", lat: 34.2269302, lng: -118.535982 },
    { name: "West Hills", address: "7345 Medical Center Dr, West Hills, CA 91307", lat: 34.2022101, lng: -118.6295634 },
    { name: "Pasadena", address: "504 S Sierra Madre Blvd, Pasadena, CA 91107", lat: 34.1441123, lng: -118.1017278 },
    { name: "Van Nuys", address: "14426 Gilmore St, Van Nuys, CA 91401", lat: 34.1875687, lng: -118.4471811 },
    { name: "San Fernando", address: "777 Truman St., San Fernando, CA 91340", lat: 34.2815625, lng: -118.4388773 },
    { name: "Agoura Hills", address: "5115 Clareton Dr, Agoura Hills, CA 91301", lat: 34.1461333, lng: -118.7540099 },
    { name: "La Canada", address: "1021 Foothill Blvd, La Canada Flintridge, CA 91011", lat: 34.2047634, lng: -118.200693 },
    { name: "Whittier", address: "13470 Telegraph Rd, Whittier, CA 90605", lat: 33.938736, lng: -118.044474 },
    { name: "Beverly Hills", address: "8733 Beverly Blvd, West Hollywood, CA 90048", lat: 34.0769292, lng: -118.3815031 },
    { name: "Glendale", address: "1530 E Chevy Chase Dr, Glendale, CA 91206", lat: 34.1522403, lng: -118.2311903 },
    { name: "Canyon Country", address: "20655 Soledad Canyon Rd, Canyon Country, CA 91351", lat: 34.415772, lng: -118.4686645 },
    { name: "Culver City", address: "3831 Hughes Ave, Culver City, CA 90232", lat: 34.0227121, lng: -118.3984349 },
    { name: "Valencia", address: "24330 McBean Pkwy, Valencia, CA 91355", lat: 34.4044106, lng: -118.552926 },
    { name: "Torrance", address: "3524 Torrance Blvd, Torrance, CA 90503", lat: 33.8355029, lng: -118.3472953 },
    { name: "Mission Hills", address: "10200 Sepulveda Blvd, Mission Hills, CA 91345", lat: 34.255573, lng: -118.4672 },
    { name: "Pico Rivera", address: "8337 Telegraph Rd, Pico Rivera, CA 90660", lat: 33.9642851, lng: -118.1131204 },
    { name: "Arcadia", address: "16 E Huntington Dr, Arcadia, CA 91006", lat: 34.1399731, lng: -118.0308683 },
    { name: "Santa Monica", address: "2221 Lincoln Blvd, Santa Monica, CA 90404", lat: 34.0155591, lng: -118.486681 },
    { name: "Downey", address: "8021 4th Street, Downey, CA 90241", lat: 33.9455586, lng: -118.1353309 },
    { name: "Tarzana", address: "18372 Clark St, Tarzana, CA 91356", lat: 34.1696927, lng: -118.5333833 },
    { name: "Hollywood", address: "5255 Sunset Blvd, Los Angeles, CA 90027", lat: 34.0981967, lng: -118.3045711 },
    { name: "La Mirada", address: "12675 La Mirada Blvd, La Mirada, CA 90638", lat: 33.9161889, lng: -118.0124715 }
]; 

const employees = [
    // San Fernando Valley employees (close)
    { id: 1, name: "Employee A", lat: 34.2156, lng: -118.5289 }, // ~1.5 miles
    { id: 2, name: "Employee B", lat: 34.1834, lng: -118.5567 }, // ~3.2 miles
    { id: 3, name: "Employee C", lat: 34.2445, lng: -118.4987 }, // ~2.8 miles
    
    // Nearby valleys (medium distance)
    { id: 4, name: "Employee D", lat: 34.1389, lng: -118.3534 }, // Burbank area, ~15 miles
    { id: 5, name: "Employee E", lat: 34.0922, lng: -118.4033 }, // West Hollywood area, ~18 miles
    { id: 6, name: "Employee F", lat: 34.2734, lng: -118.6089 }, // Thousand Oaks area, ~12 miles
    
    // Further out (long commute)
    { id: 7, name: "Employee G", lat: 34.0522, lng: -118.2437 }, // Downtown LA, ~25 miles
    { id: 8, name: "Employee H", lat: 33.9425, lng: -118.4081 }, // LAX area, ~30 miles
    { id: 9, name: "Employee I", lat: 34.4208, lng: -118.2437 }, // Lancaster area, ~35 miles
    
    // Edge cases
    { id: 10, name: "Employee J", lat: 33.7701, lng: -118.1937 }, // Long Beach, ~45 miles
  ];