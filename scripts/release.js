var ReleasesList = []

$(async function(){
    const response = await fetch('https://www.boringio.com:5555/GetReleases', {
      method: 'GET',
      headers: {
        "Access-Control-Request-Method" : "POST",
        'Content-Type': 'application/json',
        "Access-Control-Allow-Origin": "*"
      }
    });
    var Res = await response.json()
    console.log(Res)
    ReleasesList = Res

    for(var Shoe of Res){
        var Element = CreateTemplateShoe(Shoe.Img,Shoe.Name,Shoe.Date)
        $("#ReleasesList").append(Element)
    }
    $("#Preloader1").css("display","none")
})

function CreateTemplateShoe(Img,Name,Date){
    return (
        `<div class="mb-4 col-md-4 col-lg-6" onclick = "VisualizeRelease('${Name}')">`+
        "<div class='card-body' style='background-color:#0A0A50 !important;border-radius: 4px;cursor: pointer;'>" +
        "<div class='row justify-content-between align-items-center'>" +
        "<div class='col'>" +
        "<div class='media'>" +
        "<div class='mr-2'>" +
        `<img src="${Img}" style='width: 70px;border-radius: .25rem !important;'>` +
        "</div>" +
        "<div class='media-body fs--1'>" +
        `<h6 class='fs-0'>${Name}</h6><br>` +
        `<h6 class='fs-0'>${ChangeDate(Date)}</h6>` +
        "<span class='fas fa-eye' style = 'float: right; margin-top: 20px; margin-right: 15px;'></span>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>"
    );
}
function ChangeDate(Date){
    switch(true){
        case Date.includes("gennaio"):
            return Date.replace("gennaio","january")
            break;
        case Date.includes("febbraio"):
            return Date.replace("febbraio","february")
            break;
        case Date.includes("marzo"):
            return Date.replace("marzo","march")
            break;
        case Date.includes("aprile"):
            return Date.replace("aprile","april")
            break;
        case Date.includes("maggio"):
            return Date.replace("maggio","may")
            break;
        case Date.includes("giungo"):
            return Date.replace("giungo","june")
            break;
        case Date.includes("luglio"):
            return Date.replace("luglio","july")
            break;
        case Date.includes("agosto"):
            return Date.replace("agosto","august")
            break;
        case Date.includes("settembre"):
            return Date.replace("settembre","september")
            break;
        case Date.includes("ottobre"):
            return Date.replace("ottobre","october")
            break;
        case Date.includes("novembre"):
            return Date.replace("novembre","november")
            break;
        case Date.includes("dicembre"):
            return Date.replace("dicembre","december")
            break;
    }
}

function VisualizeRelease(NameSelected){
    $("#rafflesList").html("")
    $("#raffles").modal("toggle")
    const Chosen = ReleasesList.filter((Shoe,i) => {
        if(Shoe.Name == NameSelected){
            return Shoe
        }
    })
    console.log("You selected")
    console.log(Chosen)
    $("#ImgRaffle").attr("src",Chosen[0].Img)
    $("#NameRaffle").text(Chosen[0].Name)
    $("#DateRaffle").text(ChangeDate(Chosen[0].Date))
    if(Chosen[0].SiteRelease.length != 0){
        for(var Site of Chosen[0].SiteRelease){
            var Element = CreateTemplateSite(Site.Url,Site.Img,Site.Site,Site.Details)
            $("#rafflesList").append(Element)
        }
    }else{
        var Element = ErrorTemplate()
        $("#rafflesList").append(Element)
    }
}

function ErrorTemplate(){
    return(
        "<div>" +
            "<h4>No raffles found for this product.</h4>" +
        "</div>"
    )
}

function CreateWindow(Type){
    console.log(Type)
    ipc.send("CreateWindow",Type)
  }

function CreateTemplateSite(UrlSite,ImgSite,NameSite,Description){
    return (`<a onclick="CreateWindow('${UrlSite}')">` +
    `<div class='media mb-3 hover-actions-trigger align-items-center' style='background-color: #203859;padding: 8px;border-radius: 4px;'>` +
    `<div class='file-thumbnail'><img class='img-fluid' width = "80" src='${ImgSite}'/></div>` +
    `<div class='media-body ml-3'>` +
    `<h6 class='mb-1'>${NameSite}</h6>` +
    `<div class='fs--1'><span class='badge badge-pill fs--2 badge-soft-danger'>${Description}</span></div>` +
    `</div>` +
    `</div>` +
    `</a>`)
}

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
