
const db_url = "https://pif3-db-postgres.herokuapp.com"
const base_url = "https://pif3.herokuapp.com/"
function selectMethod() {
    const select = document.getElementById('method-select').value;
    if (select == 'financial') {
        document.getElementById('financial').removeAttribute('hidden');
        document.getElementById('goods').setAttribute('hidden', 'true');
    }
    else {
        document.getElementById('goods').removeAttribute('hidden');
        document.getElementById('financial').setAttribute('hidden', 'true');
    }
}


function capitalize(s) {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}
function dismiss() {
    document.getElementById('donate-success').setAttribute('hidden', 'true');
}

function validateEmail(email) {
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (re.test(email)) return true
    else return false;
}
function validatePassword(password) {
    const re = /^(?=.{8,})/;
    if (re.test(password)) return true
    else return false;
}
function viewFundraisers() {
    const id = window.sessionStorage.getItem('ID');
    window.location.href = `/user/fundraisers?id=${id}`;
}
function viewForwards() {
    const id = window.sessionStorage.getItem('ID');
    window.location.href = `/user/forwards?id=${id}`;
}

function search() {
    const query = document.getElementById('query-search');
    if (query.value == '') {
        query.focus();
    }
    else {
        window.location.href = `/fundraiser/search?query=${query.value}`
    }

}

function forwardsearch() {
    const query = document.getElementById('query-search');
    if (query.value == '') {
        query.focus();
    }
    else {
        window.location.href = `/forward/search?query=${query.value}`
    }

}

function showPaymaya() {
    if (!document.getElementById('checkpaymaya').checked) {
        document.getElementById('paymaya-qr').setAttribute('hidden', `true`)
    }
    else {
        document.getElementById('paymaya-qr').removeAttribute('hidden')
    }
}
function showGcash() {
    if (!document.getElementById('checkgcash').checked) {
        document.getElementById('gcash-qr').setAttribute('hidden', `true`)
    }
    else {
        document.getElementById('gcash-qr').removeAttribute('hidden')
    }
}
// login
async function login() {
    try {
        const email = document.getElementById("login-email");
        const password = document.getElementById("login-password");
        if (email.value == "") {
            document.getElementById("login-err").removeAttribute('hidden');
            document.getElementById("login-txt").innerText = "Email Textfield cannot be empty";
            email.focus();
        } else {
            if (password.value == "") {
                document.getElementById("login-err").removeAttribute('hidden');
                document.getElementById("login-txt").innerText = "Password Textfield cannot be empty";
                password.focus();
            } else {
                if (validateEmail(email.value) == false) {
                    document.getElementById("login-err").removeAttribute('hidden');
                    document.getElementById("login-txt").innerText = "The email you've entered is invalid!";
                    email.focus();
                }
                else {
                    const credentials = {
                        Email: email.value,
                        Pass: password.value
                    }
                    const response = await fetch(`${db_url}/user/login`,            //<-Change to DB
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json;charset=utf-8'
                            },
                            body: JSON.stringify(credentials)
                        })
                    const result = await response.json();
                    if (result.body.length == 0) {
                        document.getElementById("login-err").removeAttribute('hidden');
                        document.getElementById("login-txt").innerText = "The credentials you've entered is invalid!";
                    } else {
                        let user = result.body[0];
                        window.sessionStorage.setItem('ID', user.User_ID);
                        window.sessionStorage.setItem('status', 1);
                        window.sessionStorage.setItem('first', user.User_First);
                        window.sessionStorage.setItem('last', user.User_Last);
                        window.location.href = "/";
                    }
                }

            }
        }

    } catch (error) {
        throw error;
    }

}
// user regitration
async function register() {
    const first = document.getElementById('register-first');
    const last = document.getElementById('register-last');
    const email = document.getElementById('register-email');
    const pass = document.getElementById('register-password');
    const check = document.getElementById('register-check');
    const confirm = document.getElementById('register-confirm');
    try {
        if (first.value == "" || last.value == "" || email.value == "" || pass.value == "" || confirm.value == "") {
            document.getElementById("register-err").removeAttribute('hidden');
            document.getElementById("register-txt").innerText = "Textfields cannot be Empty";
        } else {
            if (validatePassword(pass.value) == false) {
                document.getElementById("register-err").removeAttribute('hidden');
                document.getElementById("register-txt").innerText = "The password needs to be 8 characters or more!";
                pass.focus();
            }
            else {
                if (validateEmail(email.value) == false) {
                    document.getElementById("register-err").removeAttribute('hidden');
                    document.getElementById("register-txt").innerText = "The email you've entered is invalid!";
                    email.focus();
                }
                else {
                    if (pass.value !== confirm.value) {
                        document.getElementById("register-err").removeAttribute('hidden');
                        document.getElementById("register-txt").innerText = "Passwords does not match!";
                        confirm.focus();
                    } else {
                        if (check.checked == true) {
                            const credentials = {
                                First: first.value,
                                Last: last.value,
                                Email: email.value,
                                Pass: pass.value
                            }
                            const response = await fetch(`${db_url}/user/register`,            //<-Change to DB
                                {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json;charset=utf-8'
                                    },
                                    body: JSON.stringify(credentials)
                                })
                            const result = await response.json();
                            console.log(result);
                            if (result.error) {
                                document.getElementById("register-err").removeAttribute('hidden');
                                document.getElementById("register-txt").innerText = "The credentials you've entered is already in use  !";
                            } else {
                                window.location.href = "/login?success=1";
                            }
                        } else {
                            document.getElementById("register-err").removeAttribute('hidden');
                            document.getElementById("register-txt").innerText = "You have to agree to our terms and agreement for using our application!";
                        }

                    }
                }
            }


        }
    } catch (e) {

    }

}



// reload on back
window.addEventListener("pageshow", function (event) {
    var historyTraversal = event.persisted ||
        (typeof window.performance != "undefined" &&
            window.performance.navigation.type === 2);
    if (historyTraversal) {
        // Handle page restore.
        window.location.reload();
    }
});
// Logout
function logout() {
    window.sessionStorage.removeItem("ID");
    window.sessionStorage.removeItem("status");
    window.sessionStorage.removeItem('first');
    window.sessionStorage.removeItem('last');
    window.location.href = "/";
}
function back() {
    history.back();
}
// Fundraiser Donation 
function donate() {
    const userID = window.sessionStorage.getItem('ID');
    if (!userID) {
        window.location.href = "/login?error=1";
    }
    else {
        const username = window.sessionStorage.getItem('first') + " " + window.sessionStorage.getItem('last');
        const title = document.getElementById('donate-name').innerText;
        const amount = document.getElementById('donate-amount').value;
        const currency = document.getElementById('donate-currency').value;
        const ano = document.getElementById('donate-anonymous');
        const url = new URL(window.location.href);
        const fundraiserID = url.searchParams.get("id");
        const fundingID = url.searchParams.get("fund");
        let anonymous;
        let platform
        if (ano.checked) {
            anonymous = true;
            if (document.getElementById('donate-paypal').checked) {
                platform = "paypal"
            }
            // if (document.getElementById('donate-paymaya').checked) {
            //     platform = "paymaya"
            // }
            // if (document.getElementById('donate-gcash').checked) {
            //     platform = "gcash"
            // }

        } else {
            anonymous = false;
            if (document.getElementById('donate-paypal').checked) {
                platform = "paypal"
            }
            // if (document.getElementById('donate-paymaya').checked) {
            //     platform = "paymaya"
            // }
            // if (document.getElementById('donate-gcash').checked) {
            //     platform = "gcash"
            // }
        }
     window.location.href = `${base_url}donate/verify?platform=${platform}&anonymous=${anonymous}&username=${username}&user=${userID}&fundraiser=${fundraiserID}&funding=${fundingID}&title=${title}&amount=${amount}&currency=${currency}`;
    }
}

function donateGoods() {

}
// edit fundraiser
async function editFundraiser() {
    try {
        const url = new URL(window.location.href);
        const id = url.searchParams.get("id");
        const title = document.getElementById('edit-title');
        const description = document.getElementById('edit-description');
        const info = {
            id: id,
            title: title.value,
            description: description.value,
        }
        console.log(info)
        const response = await fetch('`${db_url}/fundraising/edit',            //<-Change to DB
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(info)
            })
        if (response) window.location.href = `/user/fundraisers/settings?id=${id}`
    } catch (e) {
        throw e;
    }
}
// edit forward
async function editForward() {
    try {
        const url = new URL(window.location.href);
        const id = url.searchParams.get("id");
        const title = document.getElementById('edit-title');
        const description = document.getElementById('edit-description');
        const info = {
            id: id,
            title: title.value,
            description: description.value,
        }
        console.log(info)
        const response = await fetch(`${db_url}/forward/page/edit`,            //<-Change to DB
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(info)
            })
        if (response) window.location.href = `/user/fundraisers/settings?id=${id}`
    } catch (e) {
        throw e;
    }
}

function copy() {
    const text = document.getElementById('goods-address');
    text.select();
    // text.setSelectionRange(0, 99999); 
    document.execCommand("copy");

}

async function addComment() {
    const url = new URL(window.location.href);
    const fundraiser = url.searchParams.get("fundraiser");
    const donation = url.searchParams.get("id");
    const comment = document.getElementById('donate-comment').value;
    const user = window.sessionStorage.getItem('ID');
    const name = window.sessionStorage.getItem('first') + " " + window.sessionStorage.getItem('last');
    if (comment == "") {
        window.location.href = `/fundraiser/page?id=${fundraiser}&success=1`
    } else {
        try {
            const body = {
                user: user,
                fundraiser: fundraiser,
                donation: donation,
                description: comment,
                name: name,
            }
            console.log(body)
            const addComment = await fetch(`${db_url}/comments/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(body)
            })
            window.location.href = `/fundraiser/page?id=${fundraiser}&success=1`
        } catch (e) {
            throw e;
        }
    }
}

async function addGoods() {

    const url = new URL(window.location.href);
    const forward = url.searchParams.get('id');
    const item = document.getElementById('goods-item').value;
    const quantity = document.getElementById('goods-quantity').value;
    const address = document.getElementById('goods-address').value;
    try {
        const goods = {
            forward: forward,
            item: item,
            quantity: quantity,
            address: address,

        }
        const response = await fetch(`${db_url}/forward/add/goods`,            //<-Change to DB
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(goods)
            })
        const res = await response.json();

        if (res.message) {
            window.location.href = `/user/forwards?id=${window.sessionStorage.getItem('ID')}`
        }

    } catch (e) {
        document.getElementById('method-error').removeAttribute('hidden')
        document.getElementById('error-text').innerText = "You already have existing funding for this category"
    }
}

async function addFunding() {
  
    const url = new URL(window.location.href);
    const fundraiser = url.searchParams.get('id');
    let paypal
    const paymaya = document.getElementById('paymaya-img');
    const gcash = document.getElementById('gcash-img');
    const quota = document.getElementById('method-quota').value;
    if (!document.getElementById('checkpaypal').checked) {
        paypal = false
    }
    else {
        paypal = true
    }
    try {
        const funding = {
            fundraiser: fundraiser,
            method: 'funding',
            quota: quota,
            date: 'disabled',
            total: '0',
            paypal: paypal
        }
        const response = await fetch(`${db_url}/fundraising/add/method`,            //<-Change to DB
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(funding)
            })
        const res = await response.json();
        if (res.body[0]) {
            if (paymaya.files.length != 0) {
                const fd = new FormData;
                fd.append('paymaya-qr', paymaya.files[0]);
                fd.append('funding', res.body[0].Funding_ID);
                const response = await fetch('`${db_url}/fundraising/add/paymaya',            //<-Change to DB
                    {
                        method: 'POST',
                        body: fd
                    })
                const result = await response.json();
            }
            if (gcash.files.length != 0) {
                const fd = new FormData;
                fd.append('gcash-qr', gcash.files[0])
                fd.append('funding', res.body[0].Funding_ID)
                const response = await fetch('`${db_url}/fundraising/add/gcash',            //<-Change to DB
                    {
                        method: 'POST',
                        body: fd
                    })
                const result = await response.json();
            }
        }
        window.location.href = `/user/fundraisers?id=${window.sessionStorage.getItem('ID')}`
    } catch (e) {
        document.getElementById('method-error').removeAttribute('hidden')
        document.getElementById('error-text').innerText = "You already have existing funding for this category"
        console.log(e.message)
    }


}

async function addUpdate() {
    const u = document.getElementById('user-update').value;
    const url = new URL(window.location.href);
    const ID = url.searchParams.get("id");
    const update = {
        description: u,
        fundraiser: ID
    }
    try {
        const response = await fetch(`${db_url}/update/add`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(update)
            });
        const result = await response.json();
        if (result) window.location.reload();
    } catch (e) {
        console.log(e.message);
    }
}

async function addFundraiser() {
    const title = document.getElementById('add-title');
    const image = document.getElementById('add-image');
    const description = document.getElementById('add-desc');
    const type = document.getElementById('add-type');
    const fd = new FormData;
    fd.append('user', window.sessionStorage.getItem('ID'))
    fd.append('title', title.value)
    fd.append('description', description.value)
    fd.append('type', type.value)
    fd.append('image', image.files[0])
    console.log(image.files[0])
    const fundraiser = {
        user: window.sessionStorage.getItem('ID'),
        title: title.value,
        description: description.value,
        type: type.value,
        image: image.files[0]
    }
    try {
        const response = await fetch(`${db_url}/fundraising/add/fundraiser`,            //<-Change to DB
            {
                method: 'POST',
                body: fd
            })
        const result = await response.json();
        console.log(result);
        if (result.status === 1) window.location.href = `/user/fundraisers/add/validation?id=${result.body[0].Fundraiser_ID}`

    } catch (e) {
        console.error(e)
    }

}
// add forward
async function addForward() {
    const title = document.getElementById('add-title');
    const image = document.getElementById('add-image');
    const description = document.getElementById('add-desc');
    const type = document.getElementById('add-type');
    const fd = new FormData;
    fd.append('user', window.sessionStorage.getItem('ID'))
    fd.append('title', title.value)
    fd.append('description', description.value)
    fd.append('type', type.value)
    fd.append('status', 'on process')
    fd.append('image', image.files[0])
    for (var pair of fd.entries()) {
        console.log(pair[0] + ', ' + pair[1]);
    }

    try {
        const response = await fetch(`${db_url}/forward/page/add`,            //<-Change to DB
            {
                method: 'POST',
                body: fd
            })
        const result = await response.json();
        console.log(result);
        if (result.status === 1) window.location.href = `/user/forwards/add/validation?id=${result.body[0].Forward_ID}`
    } catch (e) {
        console.error(e)
    }

}
async function addForwardValidation() {
    try {
        const url = new URL(window.location.href);
        const forward = url.searchParams.get("id");
        const validation = new FormData;
        const image = document.getElementById('valid-file');
        // foreach
        for (var x = 0; x < image.files.length; x++) {
            validation.append("image[]", image.files[x]);
        }

        validation.append('forward', forward)
        const response = await fetch(`${db_url}/forward/add/validation`,            //<-Change to DB
            {
                method: 'POST',
                body: validation
            })
        // console.log(response.status)
        if (response.status != 500) {
            window.location.href = `/user/forwards/add/method?id=${forward}`
        } else {
            image.focus();
            document.getElementById('valid-error').removeAttribute('hidden')
        }
    } catch (e) {
        console.log(e)
    }
}
async function addValidation() {
    try {
        const url = new URL(window.location.href);
        const fundraiser = url.searchParams.get("id");
        const validation = new FormData;
        const image = document.getElementById('valid-file');
        // foreach
        for (var x = 0; x < image.files.length; x++) {
            validation.append("image[]", image.files[x]);
        }

        validation.append('fundraiser', fundraiser)
        const response = await fetch(`${db_url}/fundraising/add/validation`,            //<-Change to DB
            {
                method: 'POST',
                body: validation
            })
        // console.log(response.status)
        if (response.status != 500) {
            window.location.href = `/user/fundraisers/add/method?id=${fundraiser}`
        } else {
            image.focus();
            document.getElementById('valid-error').removeAttribute('hidden')
        }
    } catch (e) {
        console.log(e)
    }
}

function withdraw(id, fund) {
    const amount = document.getElementById('withdraw-amount').innerText;
    const receiver = document.getElementById('withdraw-receiver').value;
    window.location.href = `/user/fundraisers/settings/withdraw/confirm?amount=${amount}&receiver=${receiver}&currency=USD&id=${id}&fund=${fund}`;
    // console.log(receiver)
}
let navbar = document.getElementById('navbar-nav');
let footer = document.getElementById('footer');
window.onscroll = () => {
    "use strict";
    if (document.body.scrollTop >= 100 || document.documentElement.scrollTop >= 100) {
        navbar.classList.add("text-light", "bg-darkblue");


        // navbar.classList.remove("nav-transparent");
    }
    else {
        // navbar.classList.add("nav-transparent");
        navbar.classList.remove("text-light", "bg-darkblue");

    }
}

function init() {
    const pathArray = window.location.pathname.split('/');
    if (pathArray[1] == 'login' || pathArray[1] == 'register') {
    } else {
        const status = window.sessionStorage.getItem('status');
        if (status == undefined || status == '') {
            document.getElementById('navbar-logged').setAttribute('hidden', 'true');
        }
        else {
            document.getElementById('navbar-signin').setAttribute('hidden', 'true');
            document.getElementById('navbar-name').innerText = capitalize(window.sessionStorage.getItem('first')) + " " + capitalize(window.sessionStorage.getItem('last'));
        }
    }
}



init();