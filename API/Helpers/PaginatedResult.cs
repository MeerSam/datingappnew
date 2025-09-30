using System;
using Microsoft.EntityFrameworkCore;

namespace API.Helpers;

// <T> generic type
//  generics are really just a programming construct that enable us to create classes or methods that
// work with various data types, without specifying the actual type until the code is used. So this gives us more flexible, type safe and reusable code.
public class PaginatedResult<T>
{
    public PaginationMetadata Metadata { get; set; } = default!; // override with ! to suppress nullability warnings. It’s called the null-forgiving operator, 
    //- It tells the compiler: “Trust me, this value isn’t null—even if it looks like it might be.”
    // - It does not change the runtime behavior. It only affects compile-time nullability analysis.

    public List<T> Items { get; set; } = [];
};

public class PaginationMetadata
{
    //in here we're going to have pagination related properties.
    public int CurrentPage { get; set; }
    public int TotalPages { get; set; }

    public int PageSize { get; set; }

    public int TotalCount { get; set; }

};


public class Paginationhelper {
    public static async Task<PaginatedResult<T>> CreateAsync<T>(IQueryable<T> query,
                                                            int pageNumber,
                                                            int pageSize)
    //- Use static methods for stateless logic like validation, formatting, or math operations.
    // - Use instance methods when behavior depends on the object’s internal state.

    {
        var count = await query.CountAsync();
        var items = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

        return new PaginatedResult<T>
        {
            Metadata = new PaginationMetadata
            {
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(count / (double)pageSize),
                PageSize = pageSize,
                TotalCount = count
            },
            Items = items
        };
    }

}
