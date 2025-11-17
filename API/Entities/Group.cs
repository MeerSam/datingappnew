using System;
using System.ComponentModel.DataAnnotations;

namespace API.Entities;

public class Group(string name)
{
    //primary constructor using name
    [Key]
    public string Name { get; set; } = name;// making name a primary key : and it will be indexed

    // Navigation Properties 
    public ICollection<Connection> Connections { get; set; } = [];
}
