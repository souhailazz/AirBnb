const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Configuration SQL Server
const config = {
    user: 'Admine',
    password: 'testtest',
    server: 'DESKTOP-5ITJ9LT\\SQLEXPRESS',
    database: 'AppartementReservationDB',
    options: {
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

// Connexion SQL avec gestion d'erreur
const connectDB = async () => {
    try {
        await sql.connect(config);
        console.log('✅ Connected to SQL Server!');
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
    }
};
connectDB();
// Signup API
app.post('/api/user/signup', async (req, res) => {
    const { nom, prenom, mail, password } = req.body;

    if (!mail || !password || !nom || !prenom) {
        return res.status(400).send("Invalid client data.");
    }

    try {
        // Check if the email is already registered
        const emailCheckQuery = "SELECT * FROM Client WHERE Mail = @mail";
        const emailCheckRequest = new sql.Request();
        emailCheckRequest.input('mail', sql.NVarChar, mail);
        const emailCheckResult = await emailCheckRequest.query(emailCheckQuery);
        
        if (emailCheckResult.recordset.length > 0) {
            return res.status(409).send("Email is already registered.");
        }

        // Insert new client into the database (no hashing for password)
        const insertQuery = "INSERT INTO Client (Mail, Nom, Prenom, Password) VALUES (@mail, @nom, @prenom, @password)";
        const insertRequest = new sql.Request();
        insertRequest.input('mail', sql.NVarChar, mail);
        insertRequest.input('nom', sql.NVarChar, nom);
        insertRequest.input('prenom', sql.NVarChar, prenom);
        insertRequest.input('password', sql.NVarChar, password); // Store plain password
        
        await insertRequest.query(insertQuery);
        res.status(200).send("User registered successfully.");
    } catch (err) {
        console.error("Error during signup:", err.message);
        res.status(500).send("Internal server error.");
    }
});

// Login API
app.post('/api/user/login', async (req, res) => {
    const { mail, password } = req.body;

    if (!mail || !password) {
        return res.status(400).json({ error: "Invalid login data." });
    }

    try {
        // Ensure database connection
        if (!sql.connected) {
            await sql.connect(process.env.DB_CONFIG);
        }

        // Prepare and execute query
        const query = "SELECT * FROM Client WHERE LOWER(Mail) = LOWER(@mail)";
        const request = new sql.Request();
        request.input("mail", sql.NVarChar, mail);
        const result = await request.query(query);


        if (result.recordset.length === 0) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        const client = result.recordset[0];
        const storedPassword = client["password"]; // Ensure correct casing for the password field

       

        // Compare passwords (without hashing)
        if (password !== storedPassword) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        res.status(200).json({ message: "Login successful!" });

    } catch (err) {
        console.error("Error during login:", err.message);
        res.status(500).json({ error: "Internal server error." });
    }
});


app.get('/api/apartments', async (req, res) => {
    try {
        let query = "SELECT * FROM Appartement WHERE 1=1"; 
        const params = [];

        if (req.query.location) {
            query += " AND Ville LIKE @location";
            params.push({ name: "location", type: sql.NVarChar, value: `%${req.query.location}%` });
        }
        if (req.query.adults) {
            query += " AND NbrAdultes >= @adults";
            params.push({ name: "adults", type: sql.Int, value: parseInt(req.query.adults) });
        }
        if (req.query.children) {
            query += " AND NbrEnfants >= @children";
            params.push({ name: "children", type: sql.Int, value: parseInt(req.query.children) });
        }
        if (req.query.pets) {
            query += " AND AccepteAnimaux = @pets";
            params.push({ name: "pets", type: sql.Bit, value: req.query.pets === "true" });
        }

        const request = new sql.Request();
        params.forEach(p => request.input(p.name, p.type, p.value));

        const result = await request.query(query);
        res.json(result.recordset.length ? result.recordset : { message: "No apartments found." });

    } catch (err) {
        res.status(500).send("Server error: " + err.message);
    }
});

app.get(['/api/apartments/:id', '/api/Apartments/:id'], async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Fetching details for apartment ID: ${id}`);
        
        // Fetch apartment details
        const apartmentQuery = "SELECT * FROM Appartement WHERE Id = @id";
        const apartmentRequest = new sql.Request();
        apartmentRequest.input('id', sql.Int, id);
        const apartmentResult = await apartmentRequest.query(apartmentQuery);
        
        if (apartmentResult.recordset.length) {
            const apartment = apartmentResult.recordset[0];

            // Fetch associated photos
            const photosQuery = "SELECT photo_url FROM AppartementPhotos WHERE appartement_id = @id";
            const photosRequest = new sql.Request();
            photosRequest.input('id', sql.Int, id);
            const photosResult = await photosRequest.query(photosQuery);
            apartment.Photos = photosResult.recordset.map(photo => photo.photo_url);

            res.json(apartment);
        } else {
            console.log('Apartment not found');
            res.status(404).json({ message: "Apartment not found" });
        }
    } catch (err) {
        console.error("Error fetching apartment details:", err.message);
        res.status(500).send("Server error: " + err.message);
    }
});

// New endpoint to fetch apartment availability
app.get('/api/apartments/:id/availability', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Fetching availability for apartment ID: ${id}`);

        // Fetch unavailable dates from reservations for the specified apartment
        const availabilityQuery = `
            SELECT DISTINCT r.date_depart AS unavailable_date
            FROM Reservation r
            WHERE r.id_appartement = @id
            UNION
            SELECT DISTINCT r.date_sortie AS unavailable_date
            FROM Reservation r
            WHERE r.id_appartement = @id
        `;
        const availabilityRequest = new sql.Request();
        availabilityRequest.input('id', sql.Int, id);
        const availabilityResult = await availabilityRequest.query(availabilityQuery);

        if (availabilityResult.recordset.length) {
            const unavailableDates = availabilityResult.recordset.map(record => record.unavailable_date);
            res.json(unavailableDates);
        } else {
            res.status(404).json({ message: "No availability data found" });
        }
    } catch (err) {
        res.status(500).send("Server error: " + err.message);
    }
});

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
