namespace StatementFlex.Application.Validators;

public static class CommonValidators
{
    public const string EmailExpression = @"^(?("")("".+?(?<!\\)""@)|(([0-9a-z]((\.(?!\.))|[-!#\$%&'\*\+/=\?\^`\{\}\|~\w])*)(?<=[0-9a-z])@))(?(\[)(\[(\d{1,3}\.){3}\d{1,3}\])|(([0-9a-z][-\w]*[0-9a-z]*\.)+[a-z0-9][\-a-z0-9]{0,22}[a-z0-9]))$";
    public const string CellphoneNumberExpression = @"^(\+27|27|0)[6-8][0-9]{8}$";
    public const string PasswordExpression = @"[!@#\$%\^&\*\(\)_\+\-=\[\]\{\};:'"",<>\.\?\/~\\`\|]";
    public const string FirstNameAndLastNameExpression = @"^[a-zA-Z\s\-\'\.]+$";
}
