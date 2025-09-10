using System;
using CloudinaryDotNet.Actions;

namespace API.Interfaces;

public interface IPhotoService
{
    Task<ImageUploadResult> UploadPhotoAsync(IFormFile file); // IFormFile is what we use to represent a file in .net

    Task<DeletionResult> DeletePhotoAsync(string publicId); // IFormFile is what we use to represent a file in .net

}
