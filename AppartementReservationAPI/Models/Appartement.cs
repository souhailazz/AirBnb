namespace AppartementReservationAPI.Models
{
    public class Appartement
    {
        public int Id { get; set; }
        public string? Titre { get; set; }
        public string? Description { get; set; }
        public string? Adresse { get; set; }
        public string? Ville { get; set; }
        public decimal Prix { get; set; }
        public int Capacite { get; set; }
        public int NbrAdultes { get; set; } // Max number of adults
        public int NbrEnfants { get; set; } // Max number of children
        public bool AccepteAnimaux { get; set; } // Pets allowed (true/false)
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public List<AppartementPhotos>? Photos { get; set; } // List of photo URLs
    }
}
