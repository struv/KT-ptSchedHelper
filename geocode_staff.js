const https = require('https');
const fs = require('fs');

// Read and parse CSV
const csvContent = fs.readFileSync('StaffAddresses.csv', 'utf-8');
const lines = csvContent.trim().split('\n');

// Parse CSV data
const staff = [];
for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split by comma but respect quoted fields
    const fields = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            fields.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    fields.push(current.trim());

    // Format: Employee Id, Last Name, Preferred/First Name, Home Address 1, Home City, Home State, Home Zip Code
    if (fields.length >= 7) {
        const [empId, lastName, firstName, addr, city, state, zip] = fields;

        if (lastName && firstName) {
            // Build full address
            const addressParts = [addr, city, state, zip]
                .map(p => p.replace(/"/g, '').trim())
                .filter(p => p);
            const fullAddress = addressParts.join(', ');

            staff.push({
                id: empId.trim(),
                lastName: lastName.trim(),
                firstName: firstName.trim(),
                address: fullAddress
            });
        }
    }
}

console.log(`Found ${staff.length} staff members`);

// Geocode function using Nominatim (OpenStreetMap)
async function geocodeAddress(address) {
    return new Promise((resolve, reject) => {
        const encodedAddress = encodeURIComponent(address);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;

        https.get(url, {
            headers: {
                'User-Agent': 'PTSchedHelper/1.0'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.length > 0) {
                        resolve({
                            lat: parseFloat(json[0].lat),
                            lng: parseFloat(json[0].lon)
                        });
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// Delay function to respect rate limits (1 request per second for Nominatim)
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Process all staff
async function processStaff() {
    const results = [];
    const notFound = [];

    for (let i = 0; i < staff.length; i++) {
        const member = staff[i];
        console.log(`Processing ${i + 1}/${staff.length}: ${member.firstName} ${member.lastName}`);

        try {
            const coords = await geocodeAddress(member.address);

            if (coords) {
                // Round to 3 decimal places for confidentiality
                results.push({
                    name: `${member.firstName} ${member.lastName}`,
                    lat: Math.round(coords.lat * 1000) / 1000,
                    lng: Math.round(coords.lng * 1000) / 1000
                });
                console.log(`  ✓ Found: ${coords.lat}, ${coords.lng}`);
            } else {
                notFound.push({
                    name: `${member.firstName} ${member.lastName}`,
                    address: member.address
                });
                console.log(`  ✗ Not found`);
            }
        } catch (error) {
            notFound.push({
                name: `${member.firstName} ${member.lastName}`,
                address: member.address
            });
            console.log(`  ✗ Error: ${error.message}`);
        }

        // Wait 1 second between requests to respect rate limits
        if (i < staff.length - 1) {
            await delay(1100);
        }
    }

    // Write results to file
    const output = `const staff = ${JSON.stringify(results, null, 4)};\n`;
    fs.writeFileSync('staff_geocoded.js', output);

    console.log(`\nDone! Geocoded ${results.length}/${staff.length} staff members`);
    console.log('Results written to staff_geocoded.js');

    // Print list of staff that couldn't be geocoded
    if (notFound.length > 0) {
        console.log(`\n\n=== ${notFound.length} Staff Not Found ===`);
        notFound.forEach(s => {
            console.log(`${s.name}: ${s.address}`);
        });
    }
}

processStaff().catch(console.error);
