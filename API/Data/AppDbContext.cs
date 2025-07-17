using System;
using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class AppDbContext(DbContextOptions options) : DbContext(options)
{
    //public AppDbContext(DbContextOptions options) : base(options){}
    // used primary constructor

    public DbSet<AppUser> Users { get; set; }


}
