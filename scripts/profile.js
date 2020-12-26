var mysql = require("mysql");
var moment = require("moment");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { getStates } = require('country-state-picker')
var config = require("electron").remote.getGlobal("configuration");
var connection = require("electron").remote.getGlobal("conn");
const app = require("electron").remote.app;
const { table } = require("console");
var ListProfiles = [] 
const DirectoryBot = app.getPath("userData")
const FullPath = path.join(DirectoryBot,"/profiles/Profiles.json")
var ArrayProfiles = []
var Modifying = false
var GlobalIndex = null

function minimize(){
    ipc.send("Minimize")
}

function maximize(){
    ipc.send("Maximize")
}

function quit(){
    ipc.send("AppQuit")
}

function LogOut(){
    ipc.send("LogOut")
}

function CheckConnection(){
    ipc.send("CheckConnection")
}

if (!fs.existsSync(path.join(DirectoryBot,"/profiles"))){
    fs.mkdirSync(path.join(DirectoryBot,"/profiles"));
}

$(function(){
    LoadProfiles()
})

async function LoadProfiles(){
    console.log("Loading profiles")
    var rawFile = new XMLHttpRequest();
    try{
        rawFile.open("GET", FullPath, false);
        rawFile.onreadystatechange = function ()
        {
            if(rawFile.readyState === 4)
            {
                if(rawFile.status === 200 || rawFile.status == 0)
                {
                    try{
                        var Data = JSON.parse(rawFile.responseText);
                    }catch(err){
                        console.log(err)
                        fs.writeFileSync(FullPath,JSON.stringify(ArrayProfiles)); 
                    }
                    console.log(Data)
                    for(var Profile of Data){
                        var p = new Profile1(
                            Profile.nomeProfilo,
                            Profile.nome,
                            Profile.cognome,
                            Profile.email,
                            Profile.telefono,
                            Profile.indirizzo1,
                            Profile.indirizzo2,
                            Profile.country,
                            Profile.countryCode,
                            Profile.state,
                            Profile.citta,
                            Profile.cap,
                            Profile.possessoreCarta,
                            Profile.numeroCarta,
                            Profile.mese,
                            Profile.anno,
                            Profile.cvc
                        )
                        ListProfiles.push(p)
                    }
                    PrintProfiles()
                }
            }
        }
        rawFile.send(null);   
    }
    catch(err){
        console.log(err)
        if(fs.existsSync(FullPath) != true){
            fs.writeFile(FullPath,JSON.stringify(ArrayProfiles), function(err) {
                if(err) {
                    return console.log(err);
                }
            }); 
        }
        location.reload()
    }
}

class Profile1{
    constructor (nomeProfilo,nome,cognome,email,telefono,indirizzo1,indirizzo2,country,countryCode,stato,citta,cap,possessoreCarta,numeroCarta,mese,anno,cvc){
        this.nomeProfilo = nomeProfilo
        this.nome = nome
        this.cognome = cognome
        this.email = email
        this.telefono = telefono
        this.indirizzo1 = indirizzo1
        this.indirizzo2 = indirizzo2
        this.cap = cap
        this.country = country
        this.countryCode = countryCode
        this.state = stato
        this.citta = citta
        this.possessoreCarta = possessoreCarta
        this.numeroCarta = numeroCarta
        this.mese = mese
        this.anno = anno
        this.cvc = cvc
    }

    GetId(){
        return this.id
    }

    SetId(NewId){
        this.id = NewId
    }
}

async function RewriteFile(){
    console.log("Refresh page")
    fs.writeFileSync(FullPath,JSON.stringify(ListProfiles))
    window.location.reload()
}

function PrepareEdit(Index){
    Modifying = true
    GlobalIndex = Index
    document.getElementById('nomeProfiloAdd').value = ListProfiles[Index].nomeProfilo
    document.getElementById('nomePersona').value = ListProfiles[Index].nome
    document.getElementById('cognomePersona').value = ListProfiles[Index].cognome
    document.getElementById('emailPersona').value = ListProfiles[Index].email
    document.getElementById('telefonoPersona').value = ListProfiles[Index].telefono
    document.getElementById('addressPersona').value = ListProfiles[Index].indirizzo1
    document.getElementById('address2Persona').value = ListProfiles[Index].indirizzo2
    document.getElementById('statoPersona').value = ListProfiles[Index].countryCode
    //$("#statoPersona option:selected").text(ListProfiles[Index].countryCode)
    document.getElementById('cittaPersona').value = ListProfiles[Index].citta
    document.getElementById('zipPersona').value = ListProfiles[Index].cap
    document.getElementById('cardHolder').value = ListProfiles[Index].possessoreCarta
    document.getElementById('numeroCarta').value = ListProfiles[Index].numeroCarta
    document.getElementById('meseCarta').value = ListProfiles[Index].mese
    document.getElementById('annoCarta').value = ListProfiles[Index].anno
    document.getElementById('cvcCarta').value =ListProfiles[Index].cvc
    ChangeStateRegion()
    document.getElementById('StateRegionAdd').value = ListProfiles[Index].state
    $("#AddButton").text("Edit")
}

function AddProfile(){
    var NP = []
    NP[0] = document.getElementById('nomeProfiloAdd').value
    NP[1] = document.getElementById('nomePersona').value
    NP[2] = document.getElementById('cognomePersona').value
    NP[3] = document.getElementById('emailPersona').value
    NP[4] = document.getElementById('telefonoPersona').value
    NP[5] = document.getElementById('addressPersona').value
    NP[6] = document.getElementById('address2Persona').value
    NP[8] = document.getElementById('statoPersona').value
    NP[7] = $("#statoPersona option:selected").text()
    NP[9] = document.getElementById('StateRegionAdd').value
    NP[10] = document.getElementById('cittaPersona').value
    NP[11] = document.getElementById('zipPersona').value
    NP[12] = document.getElementById('cardHolder').value
    NP[13] = document.getElementById('numeroCarta').value
    NP[14] = document.getElementById('meseCarta').value
    NP[15] = document.getElementById('annoCarta').value
    NP[16] = document.getElementById('cvcCarta').value

    var Correct = true
    for(var Key of NP){
        if(Key == "" || Key == undefined || Key == null){
            Correct = false
        }
    }

    if(Correct == true){
        var p = new Profile1(NP[0],NP[1],NP[2],NP[3],NP[4],NP[5],NP[6],NP[7],NP[8],NP[9],NP[10],NP[11],NP[12],NP[13],NP[14],NP[15],NP[16],NP[17])
        console.log(p)
        if(Modifying == true){
            ListProfiles[GlobalIndex] = p
        }else{
            ListProfiles.push(p)
        }
        Modifying = false
        console.log(ListProfiles)
        RewriteFile()
    }else{
        document.getElementById("errorLabelAdd").innerHTML = "You need to fill every field in order to add this profile."
        console.log("Errore")
    }
}

function ChangeStateRegion(){
    var StateCode = $("#statoPersona option:selected")
    document.getElementById("StateRegionAdd").innerHTML = ""
    let StatesForCountry = getStates(StateCode.val().toLowerCase())
    for(var State of StatesForCountry){
        console.log(State)
        if(State != "")document.getElementById("StateRegionAdd").innerHTML += "<option value = "+State+">"+State+"</option>"
    }
}

function AddFirstState(){
    document.getElementById("StateRegionAdd").innerHTML = ""
    let StatesForCountry = getStates("af")
    for(var State of StatesForCountry){
        console.log(State)
        if(State != "")document.getElementById("StateRegionAdd").innerHTML += "<option value = "+State+">"+State+"</option>"
    }
    $("#addProfile").modal("toggle")
}

$('#addProfile').on('hidden.bs.modal', function () {
    console.log("Pulisco il modal")
    $(this).find("input,textarea,select").val('').end();
});

function AddFirstStateEdit(country){
    document.getElementById("StateRegionEdit").innerHTML = ""
    let StatesForCountry = getStates(country.toLowerCase())
    for(var State of StatesForCountry){
        if(State != "")document.getElementById("StateRegionEdit").innerHTML += "<option value = "+State+">"+State+"</option>"
    }
}

function Duplicate(Index){
    var SelectedProfile = ListProfiles[Index]
    ListProfiles.push(SelectedProfile)
    RewriteFile()
}

function Delete(Index){
    var index = Index
    if(index !== -1){
        ListProfiles.splice(index, 1);
        RewriteFile()
    }
}

function PrintProfiles(){
    var cont = 0
    console.log("Provo a printare")
    console.log(ListProfiles)
    for(var Profile of ListProfiles){
        console.log(Profile)
        var SingleProfile = TemplateProfile(cont,Profile.nomeProfilo,Profile.nome,Profile.cognome,Profile.indirizzo1,Profile.numeroCarta,Profile.country)
        $("#ProfilesList").append(SingleProfile)
        cont+=1
    }
    $("#Preloader1").css("display","none")
}

function Visualize(Index){
    ActualProfile = ListProfiles[Index]
    document.getElementById("nomePersonaCheck").innerText = ActualProfile.nome
    document.getElementById("cognomePersonaCheck").innerText = ActualProfile.cognome
    document.getElementById("emailPersonaCheck").innerText = ActualProfile.email
    document.getElementById("telefonoPersonaCheck").innerText = ActualProfile.telefono
    document.getElementById("addressPersonaCheck").innerText = ActualProfile.indirizzo1
    document.getElementById("address2PersonaCheck").innerText = ActualProfile.indirizzo2
    document.getElementById("zipPersonaCheck").innerText = ActualProfile.cap
    document.getElementById("statoPersonaCheck").innerText = ActualProfile.country
    document.getElementById("regionePersonaCheck").innerText = ActualProfile.state
    document.getElementById("cittaPersonaCheck").innerText = ActualProfile.citta
    document.getElementById("numeroCartaCheck").innerText = ActualProfile.numeroCarta
    document.getElementById("cardHolderCheck").innerText = ActualProfile.possessoreCarta
    document.getElementById("meseCartaCheck").innerText = ActualProfile.mese
    document.getElementById("annoCartaCheck").innerText = ActualProfile.anno
    document.getElementById("cvcCartaCheck").innerText = ActualProfile.cvc
    $("#checkProfile").modal()
}

function TemplateProfile(Index,NameProfile,Nome,Cognome,Indirizzo1,CardNumber,Country){
    CardNumber=CardNumber.split(" ").join("")
    var Last4Digits = CardNumber.slice(CardNumber.length - 4)
    return `<tr id = "${Index}" >` +
        "<td class='align-middle font-weight-semi-bold'>"+NameProfile+"</td>" +
        "<td class='align-middle font-weight-semi-bold'><span class='badge badge rounded-capsule badge-soft-success'>"+Nome+"</span></td>" +
        "<td class='align-middle font-weight-semi-bold'><span class='badge badge rounded-capsule badge-soft-info'>"+Cognome +"</span></td>" +
        "<td class='align-middle font-weight-semi-bold'>"+Country+"</td>" +
        "<td class='align-middle font-weight-semi-bold'>"+Indirizzo1 + "</td>" +
        "<td class='align-middle font-weight-semi-bold'><span class='badge badge rounded-capsule badge-soft-warning'>"+ Last4Digits +"</span></td>" +
        "<td></td>" +
        "<td class='align-middle'>" +
            "<button class='btn btn-falcon-default btn-sm' type='button' onclick = 'Visualize("+ Index +")'>" +
                "<span class='fas fa-eye' data-fa-transform='shrink-3 down-2'></span>" +
            "</button>" +
            "<button class='btn btn-falcon-default btn-sm' type='button' onclick = 'PrepareEdit(" + Index +")' data-toggle='modal' data-target='#addProfile'>" +
                "<span class='fas fa-pencil-alt' data-fa-transform='shrink-3 down-2'></span>" +
            "</button>" +
            "<button class='btn btn-falcon-default btn-sm' type='button' onclick = 'Duplicate("+ Index +")'>" +
                "<span class='fas fa-clone' data-fa-transform='shrink-3 down-2'></span>" +
            "</button>" +
            "<button class='btn btn-falcon-default btn-sm' type='button' onclick = 'Delete("+ Index +")'>" +
                "<span class='fas fa-trash' data-fa-transform='shrink-3 down-2'></span>" +
            "</button>" +
        "</td>" +
    "</tr>"
} 

function Export(){
    $("#exportProfile").modal("toggle")
}

function ExportProfile(){
    var Bot = document.getElementById("ProfileToExport").value
    switch(Bot){
        case "SoleAio":
            CreateJsonSoleAio()
        break;
        case "Adept":
            CreateJsonAdept()
        break;
        case "Velox":
            CreateJsonVelox()
        break;
        case "Fleek":
            CreateJsonFleek()
        break;
        case "NikeShoeBot":
            CreateJsonNikeShoeBot()
        break;
        case "Ganesh":
            CreateJsonGanesh()
        break;
        case "Mek":
            CreateJsonMek()
        break;  
        case "Wrath":
            CreateJsonWrath()
        break;
        case "TheKickStation":
            CreateJsonTheKickStation()
        break;
    }
}
//FATTO SOLEAIO
function CreateJsonSoleAio(){
    var MultipleJson = ""
    for(var Profile in ListProfiles){
        console.log(Profile)
        var JsonToDownload = {
            "ID":Math.floor(Math.random() * (100000 - 0)) + 0,
            "ProfileName":Profile.nomeProfilo,
            "Email":Profile.email,
            "Phone":Profile.telefono,
            "ShippingFirstName":Profile.nome,
            "ShippingLastName":Profile.cognome,
            "ShippingAddress1":Profile.indirizzo1,
            "ShippingAddress2":Profile.indirizzo2,
            "ShippingCity":Profile.citta,
            "ShippingZip":Profile.cap,
            "ShippingCountry":Profile.country,
            "ShippingState":Profile.state,
            "UseBilling":false,
            "BillingFirstName":"",
            "BillingLastName":"",
            "BillingAddress1":"",
            "BillingAddress2":"",
            "BillingCity":"",
            "BillingZip":"",
            "BillingCountry":"United Kingdom",
            "BillingState":"",
            "CardNumber":Profile.numeroCarta,
            "CardName":Profile.possessoreCarta,
            "CardCvv":Profile.cvc,
            "CardExpiryMonth":Profile.mese,
            "CardExpiryYear":Profile.anno,
            "CardType":"",
            "CheckoutLimit":"No checkout limit"
        }
        MultipleJson += JSON.stringify(JsonToDownload) + ","
    }
    MultipleJson = "[" + MultipleJson + "]"
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/json;charset=utf-8,' + encodeURI(MultipleJson);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'SoleAio.json';
    hiddenElement.click();
}

function CreateJsonAdept(){
    //alert("Adept")
    var MultipleJson = ""
    for(var Profile of ListProfiles){
        var JsonToDownload = {
            'BillingAddress1': Profile.indirizzo1,
            'BillingAddress2': Profile.indirizzo2,
            'BillingAddress3': '',
            'BillingCity': Profile.citta,
            'BillingCountryCode': Profile.countryCode,
            'BillingCountryName': Profile.country,
            'BillingState': Profile.state,
            'BillingZip': Profile.cap,
            'CreditCardCV2': Profile.cvc,
            'CreditCardMonth':Profile.mese,
            'CreditCardNumber': Profile.anno,
            'CreditCardType': "",
            'CreditCardYear': Profile.anno,
            'Email': Profile.email,
            'FirstName': Profile.nome,
            'LastName': Profile.cognome,
            'Phone': Profile.telefono,
            'ProfileName' : Profile.nomeProfilo
        }
        MultipleJson += JSON.stringify(JsonToDownload) + ","
    }
    MultipleJson = "[" + MultipleJson + "]"
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/json;charset=utf-8,' + encodeURI(MultipleJson);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'Adept.json';
    hiddenElement.click();
}

function CreateJsonVelox(){
    var MultipleJson = ""
    for(var Profile of ListProfiles){
        var JsonToDownload = {
            'name' : Profile.nomeProfilo,
            'shipping' : {
                'firstName': Profile.nome,
                'lastName': Profile.cognome,
                'email': Profile.email,
                'phone': Profile.telefono,
                'address': Profile.indirizzo1,
                'address2': Profile.indirizzo2,
                'city': Profile.citta,
                'zipcode': Profile.cap,
                'country': Profile.countryCode,
                'state': Profile.state
            },
            'card': {
                'type': "",
                'number': Profile.numeroCarta,
                'expiry': Profile.mese + '/' + Profile.anno,
                'cvv' : Profile.cvc
            }
        }
        MultipleJson += JSON.stringify(JsonToDownload) + ","
    }
    MultipleJson = "[" + MultipleJson + "]"
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/json;charset=utf-8,' + encodeURI(MultipleJson);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'Velox.json';
    hiddenElement.click();
}

function CreateJsonFleek(){
   // alert("Fleek")
    var MultipleJson = ""
    for(var Profile of ListProfiles){
        var JsonToDownload = {
            "FIRST NAME" :  Profile.nome,
            "LAST NAME" : Profile.cognome,
            "EMAIL" : Profile.email,
            "PHONE NUMBER" :  Profile.telefono,
            "HOUSE NUMBER" : '',
            "ADDRESS LINE 1" : Profile.indirizzo1,
            "ADDRESS LINE 2" : Profile.indirizzo2,
            "STATE" : Profile.state,
            "CITY" : Profile.citta,
            "POSTCODE / ZIP" : Profile.cap,
            "COUNTRY" : Profile.country,
            "CARD NUMBER" : Profile.numeroCarta,
            "EXPIRE MONTH" : Profile.mese,
            "EXPIRE YEAR" : Profile.anno,
            "CARD CVC" : Profile.cvc
        }
        MultipleJson += JSON.stringify(JsonToDownload) + ","
    }
    MultipleJson = "[" + MultipleJson + "]"
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/json;charset=utf-8,' + encodeURI(MultipleJson);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'Fleek.json';
    hiddenElement.click();
}

function CreateJsonNikeShoeBot(){
    //alert("NikeShoeBot")
    var MultipleJson = ""
    for(var Profile of ListProfiles){
        var JsonToDownload = {
            'shipping' : {
                'firstname': Profile.name,
                'lastname':  Profile.cognome,
                'country':  Profile.countryCode,
                'city': Profile.citta,
                'address': Profile.indirizzo1,
                'address2': Profile.indirizzo2,
                'state': Profile.stato,
                'zip': Profile.cap,
                'phone': Profile.telefono
                },
            'name': Profile.nomeProfilo,
                'cc':{
                'number': Profile.numeroCarta,
                'expiry':  Profile.mese + " / " + Profile.anno,
                'cvc': Profile.cvc,
                'name': Profile.possessoreCarta
                },
            'email': Profile.email,
            'checkoutLimit': 0,
            'billingSame': true,
            'date': 1591042833846,
            'id': Math.floor(Math.random() * (100000 - 0)) + 0
        }
        MultipleJson += JSON.stringify(JsonToDownload) + ","
    }
    MultipleJson = "[" + MultipleJson + "]"
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/json;charset=utf-8,' + encodeURI(MultipleJson);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'Nsb.json';
    hiddenElement.click();
}

function CreateJsonGanesh(){
    var MultipleJson = ""
    for(var Profile of ListProfiles){
        var JsonToDownload = {
            'Sku' : "",
            'Size' : "",
            'FirstName' : Profile.nome,
            'LastName' : Profile.cognome,
            'Email' : Profile.email,
            'PhoneNumber' : Profile.telefono,
            'HouseNumber' : "",
            'AddressLine1' : Profile.indirizzo1,
            'City' : Profile.citta,
            'Zip' : Profile.cap,
            'Country' : Profile.country,
            'CardNumber' : Profile.numeroCarta,
            'ExpireMonth' : Profile.mese,
            'ExpireYear' : Profile.anno,
            'CardCvc' : Profile.cvc
        }
        MultipleJson += JSON.stringify(JsonToDownload) + ","
    }
    MultipleJson = "[" + MultipleJson + "]"
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/json;charset=utf-8,' + encodeURI(MultipleJson);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'Ganesh.json';
    hiddenElement.click();
}
function CreateJsonMek(){
    var MultipleJson = ""
    for(var Profile of ListProfiles){
        var k = Math.floor(Math.random() * (100000 - 0)) + 0
        var JsonToDownload = {
            [k]:{
                "id": k,
                "profile_name": Profile.nomeProfilo,
                "billing_name": Profile.nome + " " +Profile.cognome,
                "order_email": Profile.email,
                "order_address": Profile.indirizzo1,
                "order_address_2": Profile.indirizzo2,
                "order_tel": Profile.telefono,
                "order_billing_zip": Profile.cap,
                "order_billing_city": Profile.citta,
                "area": "",
                "order_billing_state": Profile.state,
                "order_billing_country": Profile.country,
                "card_type": "visa",
                "cnb": Profile.numeroCarta,
                "month": Profile.month,
                "year": Profile.year,
                "vval": Profile.cvc
            }
        }
        MultipleJson += JSON.stringify(JsonToDownload) + ","
    }
    MultipleJson = "{" + MultipleJson + "}"
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/json;charset=utf-8,' + encodeURI(MultipleJson);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'Mek.json';
    hiddenElement.click();
}
function CreateJsonWrath(){
    var MultipleJson = ""
    for(var Profile of ListProfiles){
        var JsonToDownload = {  
            "name": ProfilesList.nomeProfilo,
            "billingAddress": {
                "name": Profile.nome + "" + Profile.cognome,
                "email": Profile.email,
                "phone": Profile.telefono,
                "line1": Profile.indirizzo1,
                "line2": Profile.indirizzo2,
                "line3": "",
                "postCode": Profile.cap,
                "city": Profile.citta,
                "state": Profile.state,
                "country": Profile.country
                },
                "shippingAddress": {
                "name": Profile.nome + "" + Profile.cognome,
                "email": Profile.email,
                "phone": Profile.telefono,
                "line1": Profile.indirizzo1,
                "line2": Profile.indirizzo2,
                "line3": "",
                "postCode": Profile.cap,
                "city": Profile.citta,
                "state": Profile.state,
                "country": Profile.country
                },
                "paymentDetails": {
                "nameOnCard": Profile.possessoreCarta,
                "cardType": "visa",
                "cardNumber": Profile.numeroCarta,
                "cardExpMonth": Profile.mese,
                "cardExpYear": Profile.anno,
                "cardCvv": Profile.cvc
                },
                "sameBillingAndShippingAddress": true,
                "onlyCheckoutOnce": false
        }
    }
    MultipleJson += JSON.stringify(JsonToDownload) + ","
    MultipleJson = "[" + MultipleJson + "]"
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/json;charset=utf-8,' + encodeURI(MultipleJson);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'Wrath.json';
    hiddenElement.click();
}
function CreateJsonTheKickStation(){
    var MultipleJson = ""
    for(var Profile of ListProfiles){
        var JsonToDownload = {  
            "Id":Math.floor(Math.random() * (100000 - 0)) + 0,
            "Name":Profile.nomeProfilo,
            "Billing":{
                "Pccc":null,
                "Email":Profile.email,
                "FirstName":Profile.nome,
                "Lastname":Profile.cognome,
                "AddressLine1":Profile.indirizzo1,
                "AddressLine2":Profile.indirizzo2,
                "Zip":Profile.cap,
                "City":Profile.citta,
                "CountryCode":Profile.countryCode,
                "StateCode":Profile.state,
                "Phone":Profile.telefono
            },
            "Shipping":{
                "Pccc":null,
                "Email":Profile.email,
                "FirstName":Profile.nome,
                "Lastname":Profile.cognome,
                "AddressLine1":Profile.indirizzo1,
                "AddressLine2":Profile.indirizzo2,
                "Zip":Profile.cap,
                "City":Profile.citta,
                "CountryCode":Profile.countryCode,
                "StateCode":Profile.state,
                "Phone":Profile.telefono
            },
            "Payment":{
                "CardHolder":Profile.possessoreCarta,
                "CardNumber":Profile.numeroCarta,
                "ExpirationMonth":Profile.mese,
                "ExpirationYear":Profile.anno,
                "SecurityCode":Profile.cvc,
                "CardType":0
            },
            "Options":{
                "UseBillingForShipping":true,
                "OneItemPerWebsite":false
            }
        }
    }
    MultipleJson += JSON.stringify(JsonToDownload) + ","
    MultipleJson = "[" + MultipleJson + "]"
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/json;charset=utf-8,' + encodeURI(MultipleJson);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'TheKickStation.json';
    hiddenElement.click();
}