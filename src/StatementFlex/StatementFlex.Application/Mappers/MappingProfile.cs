using System.Security.Cryptography.X509Certificates;
using AutoMapper;
using StatementFlex.Application.DTOs;
using StatementFlex.Core.Entities;
namespace StatementFlex.Application.Mappers;

public class MappingProfile :Profile
{
    public MappingProfile()
    {
        CreateMap<Customer, CustomerDTO>()
            .ForMember(x => x.FullName, opt => opt.MapFrom(src => $"{src.GetFullNames()}"));  
    }
}
