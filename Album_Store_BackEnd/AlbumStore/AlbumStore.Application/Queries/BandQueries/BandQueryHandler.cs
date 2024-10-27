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
using AlbumStore.Common.Identity;
using Microsoft.EntityFrameworkCore;

namespace AlbumStore.Application.Queries.BandQueries
{
    public class BandQueryHandler(IRepository<Band> bandRepository, ICurrentUserService service) :
        IRequestHandler<GetBandQuery, BandDto>,
        IRequestHandler<GetBandsQuery, CollectionResponse<BandDto>>
    {
        public async Task<CollectionResponse<BandDto>> Handle(GetBandsQuery request, CancellationToken cancellationToken)
        {
            IQueryable<Band> query = bandRepository.Query();
            string userId = (await service.GetCurrentUser()).UserId;
            int totalNumberOfItems = await query.CountAsync(cancellationToken);
            IQueryable<BandDto> bandDtos = query.Select(b => new BandDto
            {
                Id = b.Id,
                Name = b.Name,
                IsFavorited = b.UsersWhoLikeThisBand.Any(u => u.Id == userId),
                Genre = b.Genre.ToString()
            });
            List<BandDto> bandDtosList = await bandDtos.ToListAsync(cancellationToken);
            return new CollectionResponse<BandDto>(bandDtosList, totalNumberOfItems);
        }

        public async Task<BandDto> Handle(GetBandQuery request, CancellationToken cancellationToken)
        {
            string userId = (await service.GetCurrentUser()).UserId;

            BandDto? bandDto = await bandRepository.Query(b => b.Id == request.Id)
                .Select(b => new BandDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    IsFavorited = b.UsersWhoLikeThisBand.Any(u => u.Id == userId),
                    Genre = b.Genre.ToString()

                })
                .FirstOrDefaultAsync(cancellationToken);
            return bandDto;
        }
    }
}
