namespace StatementFlex.Core.Exceptions;

public class CustomerExceptions : Exception
{
    public CustomerExceptions(string accountnUMBER) : base("Customer Not Found")
    {

    }
}
