using System;

namespace API.Helpers;

public class CloudinarySettings
{
    // Inorder to get type safety and strongly typed property names will give us type safety 
    // as we will be making calls to their API
    public required string CloudName { get; set; }
    public required string ApiKey { get; set; }
    public required string ApiSecret   { get; set; }

}
