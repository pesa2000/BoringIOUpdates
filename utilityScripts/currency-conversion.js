
function GetCurrency(Code){
    var Curr = ""
    switch(Code){
        case "â‚¬":
            Curr = "€"
            break;
        case "Â£":
            Curr = "£"
            break;
        case "&#36":
            Curr = "$"
            break;
        case "&#8364":
            Curr = "€"
            break;
    }
    return Curr
}

exports.GetCurrencyFromUTF8 = GetCurrency