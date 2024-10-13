using FluentValidation.Results;

namespace AlbumStore.Application.Common;

public class CommandResponse : BaseResponse
{
    protected CommandResponse(params string[] errors) : base(errors) { }

    public CommandResponse(IList<ValidationFailure> errors) : base() => base.SetErrors(errors);

    public static CommandResponse Failed(IList<ValidationFailure> errors) => new(errors);

    public static CommandResponse Failed(params string[] errors) => new(errors);

    public static CommandResponse Ok() => new();

    public static CommandResponse<T> Ok<T>(T result) => new(result);

    public static CommandResponse<T> Failed<T>(IList<ValidationFailure> errors) => new(errors);

    public static CommandResponse<T> Failed<T>(IDictionary<string, IList<string>> errors) => new() { Errors = errors };

    public static CommandResponse<T> Failed<T>(params string[] errors) => new(errors);
}

public class CommandResponse<T> : CommandResponse
{
    public T Result { get; init; }

    public CommandResponse(T result) => Result = result;

    public CommandResponse(params string[] errors) : base(errors) => Result = default!;

    public CommandResponse(IList<ValidationFailure> errors) : base(errors) {}
}
