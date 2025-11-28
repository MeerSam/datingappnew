using System;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class FallbackController: Controller
{
/*Fallback controller will offload client side routing to angular.  
base Controller which we derived will allow us to return a template (index.html) 

single endpoint which will return a physical file.
any routes that dotNet : our API server doesn't know about and effectively passes off the routing responsibility to our angular app*/
    public ActionResult Index()
    {
        return  PhysicalFile(Path.Combine(Directory.GetCurrentDirectory(), 
            "wwwroot", "index.html"), "text/HTML");
    }

}
