namespace Inventory.Api.Services;

using Inventory.Api.Dtos;

public class ProductValidator
{
    public ValidationResult Validate(ProductInput input)
    {
        var result = new ValidationResult();

        if (string.IsNullOrEmpty(input.Name))
        {
            result.AddError("商品名は必須です");
        }
        else if (input.Name.Length > 100)
        {
            result.AddError("商品名は100文字以内で入力してください");
        }

        if (input.Price < 0)
        {
            result.AddError("価格は0以上で入力してください");
        }

        return result;
    }
}
