import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval

// Render 3 dots while it thinks. one at a time. Restart it when it reach 4 dots. 
function loader(element) {
  element.textContent = ''
  
  loadInterval = setInterval( () => {
    element.textContent != '.'
    if (element.textContent=== '....') {
      element.textContent = '';
    }
  }, 300)
}

// Render text one at a time to make it look like typing. once done, clear the interval. 
function typeText(element, text) {
  let index = 0
  let interval = setInterval(() => {
    if (index < text.length ) {
      element.innerHTML += text.charAt(index);
      index++;
    }
    else {
      clearInterval(interval)
    }
  }, 20)
}

// Unique ID for every ID so we can map over them. Generate ID by using current timestamp + random number. 
function generateUniqueID() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);
  //returning a template string
  return `id-${timestamp}-${hexadecimalString}`;
}

// Different color to differentiate user vs AI chat. 
// if AI, then class name = 'ai'
// under Image: if it is ai, then use bot image, otherwise use user image
function chatStripe(isAi, value, uniqueId) {
  return (
      `
      <div class="wrapper ${isAi && 'ai'}">
          <div class="chat">
              <div class="profile">
                  <img 
                    src=${isAi ? bot : user} 
                    alt="${isAi ? 'bot' : 'user'}" 
                  />
              </div>
              <div class="message" id=${uniqueId}>${value}</div>
          </div>
      </div>
  `
  )
}

// Takes in a function. 
// 
const handleSubmit = async (e) => {
  e.preventDefault()

  const data = new FormData(form)

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

  // to clear the textarea input 
  form.reset()

  // bot's chatstripe
  const uniqueId = generateUniqueID()
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

  // to focus scroll to the bottom 
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // specific message div 
  const messageDiv = document.getElementById(uniqueId)
  loader(messageDiv)

  const response = await fetch('http://localhost:5000', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          prompt: data.get('prompt')
      })
  })
  clearInterval(loadInterval)
  messageDiv.innerHTML = " "

  if (response.ok) {
      const data = await response.json();
      const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 

      typeText(messageDiv, parsedData)
  } else {
      const err = await response.text()

      messageDiv.innerHTML = "Something went wrong"
      alert(err)
  }
}


// if submit button is pressed, handleSubmit function is called
// when user press and release the enter key
form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})

