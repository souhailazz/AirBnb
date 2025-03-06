using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppartementReservationAPI.Models{
public class Paiement
{
    [Key]
    public int id { get; set; }
    
    [Required]
    public decimal total { get; set; }
    
    [Required, MaxLength(50)]
    public string methode_de_paiement { get; set; }
    
    [Required, MaxLength(100)]
    public string payment_code { get; set; }
}
}