using FluentValidation.Results;

namespace AlbumStore.Application.Common;
public abstract class BaseResponse
{
    public IDictionary<string, IList<string>> Errors { get; set; } = new Dictionary<string, IList<string>>();

    public bool IsValid => Errors.Keys.Any();

    protected BaseResponse(params string[] errors)
    {
        if (!errors.Any())
        {
            SetErrors(errors);
        }
    }

    public void AddError(string propertyName, string error)
    {
        EnsureEntry(propertyName);
        Errors[propertyName].Add(error);
    }

    public void AddError(string error) => AddError(string.Empty, error);

    public void SetErrors(string propertyName, IEnumerable<string> errors) => Errors[propertyName] = errors.ToList();

    public void SetErrors(IEnumerable<string> errors) => Errors[string.Empty] = errors.ToList();

    public void SetErrors(IList<ValidationFailure> errors)
    {
        foreach (ValidationFailure item in errors)
        {
            EnsureEntry(item.PropertyName);
            Errors[item.PropertyName].Add(item.ErrorMessage);
        }
    }

    private void EnsureEntry(string propertyName)
    {
        if (!Errors.TryGetValue(propertyName, out IList<string> value))
        {
            Errors.Add(propertyName, []);
        }
        else if (value == null)
        {
            Errors[propertyName] = [];
        }
    }
    
}