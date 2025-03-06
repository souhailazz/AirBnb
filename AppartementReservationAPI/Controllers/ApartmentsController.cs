using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AppartementReservationAPI.Data;
using AppartementReservationAPI.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;

namespace AppartementReservationAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ApartmentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ApartmentsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Apartments
        [HttpGet]
        public async Task<IActionResult> GetApartments(
            [FromQuery] string? location = null,
            [FromQuery] int? adults = null,
            [FromQuery] int? children = null,
            [FromQuery] bool? pets = null)
        {
            // Log the request
            Console.WriteLine("Received request for apartments");

            try
            {
                var query = _context.Appartements
                    .Include(a => a.Photos) // Ensure related photos are included
                    .AsQueryable();

                // Location filter (case-insensitive search)
                if (!string.IsNullOrEmpty(location))
                {
                    query = query.Where(a => a.Ville != null && EF.Functions.Like(a.Ville, $"%{location}%"));
                }

                // Adults filter
                if (adults.HasValue && adults.Value > 0)
                {
                    query = query.Where(a => a.NbrAdultes >= adults.Value);
                }

                // Children filter
                if (children.HasValue && children.Value > 0)
                {
                    query = query.Where(a => a.NbrEnfants >= children.Value);
                }

                // Pets filter
                if (pets.HasValue)
                {
                    query = query.Where(a => a.AccepteAnimaux == pets.Value);
                }

                // Log the final query
                Console.WriteLine($"Final query: {query.ToQueryString()}");

                // Execute the query
                var results = await query.ToListAsync();

                if (!results.Any())
                {
                    return NoContent();  // No apartments match the criteria, but it's not an error.
                }

                // Log the results to verify the Photos property
                Console.WriteLine($"Results: {JsonSerializer.Serialize(results)}");

                return Ok(results);
            }
            catch (Exception ex)
            {
                // Log the exception details
                Console.WriteLine($"Error fetching apartments: {ex.Message}");
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        // GET: api/Apartments/{id}
        [HttpGet("{id}")]
public async Task<ActionResult<object>> GetApartmentById(int id)
{
    var apartment = await _context.Appartements
        .Include(a => a.Photos)
        .FirstOrDefaultAsync(a => a.Id == id);

    if (apartment == null)
    {
        return NotFound($"Apartment with id {id} not found.");
    }

    // Transformer les données pour ne renvoyer que les URLs des photos
    var result = new
    {
        apartment.Id,
        apartment.Titre,
        apartment.Description,
        apartment.Adresse,
        apartment.Ville,
        apartment.Prix,
        apartment.Capacite,
        apartment.NbrAdultes,
        apartment.NbrEnfants,
        apartment.AccepteAnimaux,
        apartment.Latitude,
        apartment.Longitude,
        Photos = apartment.Photos.Select(p => new { p.photo_url }) // Ne renvoyer que les URLs
    };

    return Ok(result);
}


        // GET: api/Apartments/{id}/availability
        [HttpGet("{id}/availability")]
        public async Task<ActionResult<IEnumerable<object>>> GetApartmentAvailability(int id)
        {
            try
            {
                var reservations = await _context.Reservation
                    .Where(r => r.id_appartement == id)
                    .Select(r => new { r.date_depart, r.date_sortie })
                    .ToListAsync();

                if (reservations == null || reservations.Count == 0)
                {
                    return NotFound("No reservations found for this apartment.");
                }

                return Ok(reservations);
            }
            catch (Exception ex)
            {
                // Log the exception details
                Console.WriteLine($"Error fetching availability for apartment {id}: {ex.Message}");
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        // GET: api/Apartments/city/{ville}
        [HttpGet("city/{ville}")]
        public async Task<IActionResult> GetApartmentsByVille(string ville)
        {
            // Log the request
            Console.WriteLine($"Received request for apartments in city: {ville}");

            var apartments = await _context.Appartements
                .Where(a => a.Ville != null && a.Ville.Equals(ville, StringComparison.OrdinalIgnoreCase))
                .ToListAsync();

            if (!apartments.Any())
            {
                return NoContent();  // No apartments found in the specified city.
            }

            return Ok(apartments);
        }
    }
}
