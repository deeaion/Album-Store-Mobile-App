using AlbumStore.Application.Common;
using AlbumStore.Application.Filtering;
using AlbumStore.Application.Queries.ProductQueries;
using AlbumStore.Application.QueryProjections;
using AlbumStore.Domain.Entities;
using AlbumStore.Domain.Repositories;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AlbumStore.Application.Models;
using Microsoft.EntityFrameworkCore;

namespace AlbumStore.Application.Queries.BandQueries
{
    public class BandQueryHandler(IRepository<Band> bandRepository) :
        IRequestHandler<GetBandQuery, BandDto>,
        IRequestHandler<GetBandsQuery, CollectionResponse<BandDto>>
    {
        public async Task<CollectionResponse<BandDto>> Handle(GetBandsQuery request, CancellationToken cancellationToken)
        {
           IQueryable<Band> query = bandRepository.Query();
            int totalNumberOfItems = await query.CountAsync(cancellationToken);
            IQueryable<BandDto> bandDtos = query.Select(b => new BandDto
            {
                Id = b.Id,
                Name = b.Name,
  
            });
            List<BandDto> bandDtosList = await bandDtos.ToListAsync(cancellationToken);
            return new CollectionResponse<BandDto>(bandDtosList, totalNumberOfItems);
        }

        public async Task<BandDto> Handle(GetBandQuery request, CancellationToken cancellationToken)
        {
            BandDto? bandDto = await bandRepository.Query(b => b.Id == request.Id)
                .Select(b => new BandDto
                {
                    Id = b.Id,
                    Name = b.Name,
                })
                .FirstOrDefaultAsync(cancellationToken);
            return bandDto;
        }
    }
}
