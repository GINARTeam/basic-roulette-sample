var initializing = true

var session = undefined
var session_qr = undefined

var drawling = false

var rotating = true

var failure = false

var values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

var step = 360 / values.length

var index = 0
var expect = 0
var actual = 0

function setup() {
  createCanvas(800, 800).parent('roulette')
}

function draw() {
  angleMode(DEGREES)

  push()
  translate(400, 400)
  fill(0, 123, 255)
  triangle(310, 0, 350, 25, 350, -25)
  pop()

  push()
  translate(400, 400)
  if (rotating === true) {
    rotate(frameCount * -50.0)
  } else {
    rotate(-index * step)
  }
  roulette()
  pop()
}

function roulette() {
  beginShape()
  for (var i = 0; i < values.length; i++) {
    push()
    fill(255, 255 - i * 25, 0)
    arc(0, 0, 600, 600, -0.5 * step + i * step, 0.5 * step + i * step, PIE)
    pop()

    push()
    translate(
      200 * Math.cos(((i * step) / 180) * Math.PI),
      200 * Math.sin(((i * step) / 180) * Math.PI)
    )
    fill(0)
    textSize(25)
    text(values[i], -10, 0)
    pop()
  }
  endShape(CLOSE)
}

values.map(elm => {
  document
    .getElementById('option-' + elm.toString())
    .addEventListener('click', function() {
      document.getElementById('alert').classList.remove('alert-primary')
      document.getElementById('alert').classList.remove('alert-danger')
      document.getElementById('alert').classList.add('d-none')
      if (drawling === true) {
        return
      }
      expect = elm
    })
})

document.getElementById('roulette').addEventListener('click', function() {
  document.getElementById('randomButton').click()
})

document.getElementById('randomButton').addEventListener('click', function() {
  document.getElementById('modalHeader').classList.remove('bg-success')
  document.getElementById('modalHeader').classList.remove('bg-danger')
  document.getElementById('alert').classList.remove('alert-primary')
  document.getElementById('alert').classList.remove('alert-danger')
  document.getElementById('alert').classList.add('d-none')

  if (initializing) {
    return
  }

  // if (failure) {
  //   document.getElementById("alert").classList.add("alert-danger");
  //   document.getElementById("alert").classList.remove("d-none");
  //   document.getElementById("alert-data").innerText =
  //     "Error occured on generate random number, reload to try again!";

  //   return;
  // }

  if (!session) {
    document.getElementById('alert').classList.add('alert-danger')
    document.getElementById('alert').classList.remove('d-none')
    document.getElementById('alert-data').innerText =
      'Error occured on initializing session, reload to try again!'
    return
  }

  if (expect === 0) {
    document.getElementById('alert').classList.add('alert-primary')
    document.getElementById('alert').classList.remove('d-none')
    document.getElementById('alert-data').innerText = 'Please pick a number!'
    return
  }

  if (drawling === true) {
    return
  }

  console.log(`Session:`, session)
  console.log('Expect: ', expect)

  drawling = true
  rotating = true
  session_qr = undefined

  document.getElementById('alert').classList.add('alert-primary')
  document.getElementById('alert').classList.remove('d-none')
  document.getElementById('alert-data').innerText =
    'Requesting for random number...'

  setTimeout(function() {
    fetch(
      'https://test.ginar.io/rng/generate/' + session.toString() + '/1/12',
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${window.btoa(
            'pk_3051545020979047:sk_3051545020979048'
          )}`,
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    )
      .then(response => {
        document.getElementById('alert').classList.remove('alert-primary')
        document.getElementById('alert').classList.add('d-none')
        document.getElementById('alert-data').innerText = ''

        console.log('Response: ', response)
        return response.json()
      })
      .then(json => {
        console.log('Json: ', json)

        if (json === 'invalid request') {
          throw 'invalid request'
        }

        if (!json['nums'] || !json['beacon']) {
          // document.getElementById("alert").classList.add("alert-danger");
          // document.getElementById("alert").classList.remove("d-none");
          // document.getElementById("alert-data").innerText =
          //   "Error occured on generate random number, reload to try again!";

          // rotating = false;

          // failure = true;

          // console.log("Beacon: ", json["beacon"]);
          // return;

          document.getElementById('alert').classList.add('alert-danger')
          document.getElementById('alert').classList.remove('d-none')
          document.getElementById('alert-data').innerText =
            'Can not get random from server. Click Draw to try again!'

          session = json['sessionKey']

          rotating = false
          drawling = false

          console.log('Beacon: ', json['beacon'])
          return
        }

        actual = Number.parseInt(json['nums'][0], 10)
        console.log('Actual: ', actual)

        if (expect === actual) {
          document.getElementById('modalHeader').classList.add('bg-success')
          document.getElementById('modalTitle').innerText = 'Congratulation!'
          document.getElementById('modelBodyResult').innerText =
            'You win!' +
            ' Expect: ' +
            expect.toString() +
            ' - ' +
            ' Actual: ' +
            actual.toString()
          console.log('You win!')
        } else {
          document.getElementById('modalHeader').classList.add('bg-danger')
          document.getElementById('modalTitle').innerText = 'Good luck!'
          document.getElementById('modelBodyResult').innerText =
            'You close!' +
            ' Expect: ' +
            expect.toString() +
            ' - ' +
            ' Actual: ' +
            actual.toString()
          console.log('You close!')
        }

        session = json['sessionKey']

        document.getElementById('modelBodyVerify').innerHTML = `${'Verify: '}
          <a
            href="${`https://dev-blackbox.ginar.io/?ticketId=${session}&dest_lower=1&dest_upper=12`}"
            target="_blank">
            ${session}
          </a>
          <br />
          Our result based on the first random number!
          `

        session_qr = new QRious({
          element: document.getElementById('qr'),
          level: 'H',
          padding: 5,
          size: 500,
          value: `https://dev-blackbox.ginar.io/?ticketId=${session}&dest_lower=1&dest_upper=12`
        })

        console.log(
          `Verify:`,
          `https://dev-blackbox.ginar.io/?ticketId=${session}&dest_lower=1&dest_upper=12`
        )

        $('#modal').modal('show')

        index = actual - 1

        rotating = false
        drawling = false
      })
      .catch(error => {
        document.getElementById('alert').classList.add('alert-danger')
        document.getElementById('alert').classList.remove('d-none')
        document.getElementById('alert-data').innerText =
          'Can not get random from server. Click Draw to try again!'

        rotating = false
        drawling = false

        console.log('Error: ', error)
      })
  }, 1000)
})

document.getElementById('alert').classList.remove('alert-primary')
document.getElementById('alert').classList.remove('alert-danger')
document.getElementById('alert').classList.add('d-none')

document.getElementById('alert').classList.add('alert-primary')
document.getElementById('alert').classList.remove('d-none')
document.getElementById('alert-data').innerText = 'Initializing...'

setTimeout(function() {
  fetch(
    'https://test.ginar.io/rng/initialize/' + new Date().getTime().toString(),
    {
      method: 'GET',
      headers: {
        Authorization: `Basic ${window.btoa(
          'pk_3051545020979047:sk_3051545020979048'
        )}`,
        'Content-Type': 'application/json; charset=utf-8'
      }
    }
  )
    .then(response => {
      document.getElementById('alert').classList.remove('alert-primary')
      document.getElementById('alert').classList.add('d-none')
      document.getElementById('alert-data').innerText = ''

      console.log('Response: ', response)
      if (response.status < 200 || response.status > 299) {
        throw new Error('Invalid response')
      }
      return response.text()
    })
    .then(token => {
      if (!token) {
        return
      }
      session = token
      rotating = false
      initializing = false
      console.log('Token: ', token)
    })
    .catch(error => {
      initializing = false
      document.getElementById('alert').classList.add('alert-danger')
      document.getElementById('alert').classList.remove('d-none')
      document.getElementById('alert-data').innerText =
        'Error occured on initializing session, reload to try again!'
      console.log('Error: ', error)
    })
}, 200)
