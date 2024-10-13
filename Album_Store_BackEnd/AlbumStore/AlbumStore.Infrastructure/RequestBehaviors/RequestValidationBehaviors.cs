using FluentValidation;
using FluentValidation.Results;
using MediatR;

namespace AlbumStore.Infrastructure.RequestBehaviors;

public class RequestValidationBehavior<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators) : IPipelineBehavior<TRequest, TResponse> where TRequest : IRequest<TResponse>
{
    private List<ValidationFailure> GetValidationErrors(ValidationContext<TRequest> context) => validators
        .Select(v => v.Validate(context))
        .SelectMany(result => result.Errors)
        .Where(f => f != null)
        .ToList();

    public Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        ValidationContext<TRequest> context = new(request);
        List<ValidationFailure> failures = GetValidationErrors(context);

        return failures.Count != 0 ? throw new ValidationException(failures) : next();
    }
}
