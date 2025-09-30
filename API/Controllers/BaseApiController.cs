using API.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    // any API Calls activity that is authenticated is going 
    // to record Last Active  Date Field in our database for that authenticated user 
    [ServiceFilter(typeof(LogUserActivity))]
    [Route("api/[controller]")]
    [ApiController]
    public class BaseApiController : ControllerBase
    {
    }
}
