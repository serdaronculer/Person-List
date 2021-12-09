//! Model Class
class Person{
    constructor(name,lastName,mail) {
      this.name = name;
      this.lastName = lastName;
      this.mail = mail;
    }
}

class Util{
    //? Checks if inputs are empty. returns message and state
    static emptyInputsControl(person){
      if(person.name.length>0 && person.lastName.length>0 && person.mail.length>0){
          return {
              message:"Operation successful",
              state: true
          }
      }
      else{
          return{
              message:"Operation failed. Please fill in the required inputs",
              state: false
          }}}

    //? checks mail validity
    static validateEmail(email)
    {
        let re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    //? clears inputs
    static clearInputs(){
    const inputs =  document.querySelectorAll(".data");
     for(let item of inputs){
         item.value="";
     }
    }

}

class Screen{
    constructor() {
        this.name = document.getElementById("name");
        this.lastName = document.getElementById("surname");
        this.mail = document.getElementById("mail");
        this.personList = document.querySelector(".contact-list");
        this.form = document.getElementById("form-contact");
        this.form.addEventListener("submit",this.saveOrUpdate.bind(this));
        this.addOrUpdate = document.querySelector(".saveOrUpdate");
        this.personList.addEventListener("click",this.updateOrDelete.bind(this));
        this.cancelButton=document.querySelector("#cancelButton");
        this.cancelButton.addEventListener("click",this.cancelProcess.bind(this));
        this.selectedTr = undefined;
        this.localStorage = new LocalStorage();
        this.addAllPersonsToList();
    }

   //? used to cancel editing
    cancelProcess(e){
        this.cancelButtonActiveOrPassive(false);
    }

    //? If the edit or delete button is pressed on the relevant line
    updateOrDelete(e){
        const target = e.target;
        //? If the delete button is pressed
        if (target.classList.contains("btn-delete")){
            this.selectedTr = target.parentElement.parentElement;

            this.deletePersonFromList();
            this.giveInfo("Deletion successful",true);
        }
        //? If the edit button is pressed
        else if (target.classList.contains("btn-edit")){


            this.selectedTr = target.parentElement.parentElement;
            this.addOrUpdate.classList.add("update");
            this.addOrUpdate.value="CHANGE PERSON INFORMATION";
            this.name.value = this.selectedTr.cells[0].textContent;
            this.lastName.value=this.selectedTr.cells[1].textContent;
            this.mail.value=this.selectedTr.cells[2].textContent;
            this.cancelButtonActiveOrPassive(true);


        }

    }

    //? Enables or disables the cancel button
    cancelButtonActiveOrPassive(state){
        if (state){
            for(let i of document.querySelectorAll(".btn")){
                i.classList.add("disable");
            }

            for(let i of document.querySelectorAll("i.icon")){
                i.classList.add("disable");
            }
            document.querySelector("#cancelButton").classList.remove("cancel");
        }
        else {
            for(let i of document.querySelectorAll(".btn")){
                i.classList.remove("disable");
            }

            for(let i of document.querySelectorAll("i.icon")){
                i.classList.remove("disable");
            }
            document.querySelector("#cancelButton").classList.add("cancel");
            this.addOrUpdate.classList.remove("update");
            this.addOrUpdate.value="ADD PERSON";
            Util.clearInputs();
        }
    }

    //? values from the person class are added to the selected row
    updatePersonViaList(person){
        this.selectedTr.cells[0].textContent=person.name;
        this.selectedTr.cells[1].textContent=person.lastName;
        this.selectedTr.cells[2].textContent=person.mail;

    }

    //? delete the person from the list
    deletePersonFromList(){
        const person = new Person(this.selectedTr.cells[0].textContent,this.selectedTr.cells[1].textContent,this.selectedTr.cells[2].textContent);
        //? delete person from local store
        this.localStorage.deletePerson(person);
        this.selectedTr.remove();
        this.localStorage.allPersons.length === 0 ? localStorage.removeItem("allPersons") : false ;
        this.selectedTr=undefined;



    }

    //? Adds all person in the Array to the list
    addAllPersonsToList(){
        this.localStorage.allPersons.forEach(person => {
            this.addPersonToList(person);
        });
    }

    //? Shows information message according to the state of the process
    giveInfo(message,state){
        const infoBox = document.querySelector(".info");
        infoBox.textContent=message;
        infoBox.classList.add(state? "info-success" : "info-error");
        setTimeout(_ => {
            infoBox.className="info";
        },2000);


    }

    //? Values in the Person class are added to the <tr>
    addPersonToList(person){
    const trElement = document.createElement("tr");
    trElement.innerHTML = `<td>${person.name}</td>
               <td>${person.lastName}</td>
               <td>${person.mail}</td>
            <td>
                <button class="btn btn-edit"><i class="icon far fa-edit"></i></button>
                <button class="btn btn-delete"><i class="icon far fa-trash-alt"></i></button>
            </td>`;

    //? personList == tbody
    this.personList.appendChild(trElement);

    }

    //? if the ADD-CHANGE button is pressed
    saveOrUpdate(e){
        e.preventDefault();
        const person = new Person(this.name.value,this.lastName.value,this.mail.value);
        const result =  Util.emptyInputsControl(person);
        const emailValidity = Util.validateEmail(person.mail);
        const emailNotInUse = this.localStorage.isMailNotInUse(person.mail);
        if (result.state){
            if(emailValidity){
                if (this.addOrUpdate.classList.contains("update")){
                    if (emailNotInUse || person.mail===this.selectedTr.cells[2].textContent){
                        let oldPerson = new Person(this.selectedTr.cells[0].textContent,this.selectedTr.cells[1].textContent,this.selectedTr.cells[2].textContent);

                        //! edits from local storage
                        this.localStorage.personUpdate(person,oldPerson);

                        //! edits from list
                        this.updatePersonViaList(person);
                        this.addOrUpdate.classList.remove("update");
                        this.addOrUpdate.value="ADD PERSON";
                        this.giveInfo(result.message,result.state);
                        Util.clearInputs();
                        this.cancelButtonActiveOrPassive();
                    }
                    else {
                        this.giveInfo("This email is used",false);
                        
                    }

                }
                else {
                    if(emailNotInUse){
                        //! Adds the person to the list
                        this.addPersonToList(person);

                        //! Adds the person to the Local Storage
                        this.localStorage.addPerson(person)

                        //! informs the user
                        this.giveInfo(result.message,result.state);
                        Util.clearInputs();
                    }
                    else {
                        this.giveInfo("This email is used",false);
                    }

                }

            }
            else {
                this.giveInfo("Enter your email address correctly",false);
            }

        }
        else {
           this.giveInfo(result.message,result.state);
        }
    }



}

class LocalStorage{
    //? get data when web page loads
    constructor() {
        this.allPersons = this.bringPersons();
    }

    //? Adds data in Local Storage to Array. Creates empty Array if Local Storage has no data
    bringPersons(){
        let allPersonsLocal;
        if (localStorage.getItem("allPersons")===null){
            allPersonsLocal=[];
        }else {
            allPersonsLocal = JSON.parse(localStorage.getItem("allPersons"));
        }
        return allPersonsLocal;
    }

    //? Adds person class to Array and Local Storage
    addPerson(person){
        this.allPersons.push(person);
        localStorage.setItem("allPersons",JSON.stringify(this.allPersons));
    }

    //? Deletes person class from Array and Local Storage
    deletePerson(person){
       this.allPersons.forEach((i,index) => {
          if(i.mail===person.mail){
               this.allPersons.splice(index,1);
               localStorage.setItem("allPersons",JSON.stringify(this.allPersons));
           }
       });
    }

    //? Edits person class from Array and Local Storage
    personUpdate(personToUpdate,oldPerson){
        this.allPersons.forEach((person,index) => {
            if(person.mail===oldPerson.mail){
               this.allPersons[index]=personToUpdate;
                localStorage.setItem("allPersons",JSON.stringify(this.allPersons));
                return true;
            }
            else {
                return  false;
            }});}

    //? Checks if the mail is in the array or not
    isMailNotInUse(mail){
     const result =   this.allPersons.find(i => {
          return   i.mail===mail;
        })
       return  result === undefined ? true : false;
    }

}


document.addEventListener("DOMContentLoaded",() => {
  const screen = new Screen();
});


