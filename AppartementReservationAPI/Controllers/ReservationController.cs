using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AppartementReservationAPI.Data; // Assuming your DbContext is here
using AppartementReservationAPI.Models; // Assuming your Reservation model is here
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class ReservationController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReservationController(AppDbContext context)
    {
        _context = context; // Inject the DbContext
    }

    // GET: api/reservations/{userId}
    [HttpGet("reservations/{userId}")]
    public async Task<IActionResult> GetReservations(int userId)
    {
        // Fetch reservations for the specified user
        var reservations = await _context.Reservation
            .Where(r => r.id_client == userId) // Filter by userId
            .Include(r => r.Client) // Include related Client data
            .Include(r => r.Appartement) // Include related Appartement data
            .Include(r => r.Paiement) // Include related Paiement data
            .ToListAsync();

        // Check if any reservations were found
        if (reservations == null || !reservations.Any())
        {
            return NotFound("No reservations found for this user.");
        }

        // Return the list of reservations
        return Ok(reservations);
    }
}