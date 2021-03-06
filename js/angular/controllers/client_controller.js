'use strict';

    angular
        .module('reme')
        .controller('appController', Controller)
        .controller('ClientController', ClientController)
        .controller('ProfileController', ProfileController)
        .controller('SubscriptionController', SubscriptionController)
        .controller('ChangeController', ChangeController);

    function Controller($scope, $state, clientService)
    {	
    	$scope.days =['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31'];
        $scope.months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        $scope.genders = ['male','female','others'];
        $scope.currentYear = new Date().getFullYear();
        $scope.years = [];
        $scope.errors = [];
        $scope.saving = false;

        $scope.code_filter = "all";
        
        for (var i = 1940; i <=$scope.currentYear + 1 ; i++) {
            $scope.years.push(i);
        }
        //initialize user
        if(localStorage.user != null || localStorage.user != undefined) {
            $scope.user = JSON.parse(localStorage.user);
            $scope.old_user = $scope.user;
        }

        $scope.getClientList = function() {
	    	$scope.user = JSON.parse(localStorage.user);
	    	var data = [];
	    	data["doctor_id"] = $scope.user["id"];
	    	data["role"] =  $scope.user["role"];
	    	clientService.getClientList(data).then(function(res) {
				$scope.client_list = [];
				$scope._client_list = res.data.success;
				$scope.total_client_count = res.data.success.total;
				$scope.limit = 10;

				angular.forEach($scope._client_list, function(value, key){


					if(value.discharged_date != null) {
						value.discharged_date = formatDate(value.discharged_date);
					}
					
					if(!isNaN(parseInt(key))) {
						if(value.birth_date == null) {
							value.birth_date = '--';
							value.age = '--';
						}else {
							value.age = $scope.getAge(value.birth_date) + ' years old';
						}

				   		value.original_index = key;

						$scope.client_list.push(value);
					}
				})

				$scope.original_client_list =$scope.client_list;

				$(".loader-head").addClass("hidden");


			}).catch(function(res) {
				$scope.sending = 'off';
				console.log(res);
			});

			console.log($scope.client_list);
	    }

	    $scope.getAge = function(birthday){
		    var birthday = new Date(birthday);
		    var today = new Date();
		    var age = ((today - birthday) / (31557600000));
		    var age = Math.floor( age );

		    return age;
		}

		$scope.ucfirst = function(str,force){
              str=force ? str.toLowerCase() : str;
              return str.replace(/(\b)([a-zA-Z])/,
                       function(firstLetter){
                          return   firstLetter.toUpperCase();
                       });

         }

		$scope.logout = function() {
			clientService.logout().then(function(res) {
				if(res.data.success) {
					localStorage.clear();
					window.location.href = '/';
				}
			}).catch(function(res) {
				console.log(res.data.errors);
			})

		}

		$scope.checkAlpha = function(string) {
            return /^[a-zA-Z\s]+$/.test(string);
        }

        $scope.checkEmail = function(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }

        $scope.requiredValidator = function(text, field) {
			if(text == '' || text == undefined) {
				console.log(field, $scope.ucfirst(field).replace('_', ' ') + ' is required')
				console.log($scope.errors[field])
				$scope.errors[field] = $scope.ucfirst(field).replace('_', ' ') + ' is required';
			} else if(!$scope.checkAlpha(text)) {
				$scope.errors[field] = $scope.ucfirst(field).replace('_', ' ') + ' must be a string';
			}else {
				console.log(field);
				return $scope.errors[field] = false;
			}
		}

		$scope.checkGender = function(gender) {
            if(gender == '' || gender == undefined) {
                $scope.errors.gender = 'Gender is required';
            } else {
                return $scope.errors.gender = false;
            }
        }

        $scope.isValidDate = function(dateString) {
			var regEx = /^\d{4}-\d{2}-\d{2}$/;
			if(dateString.match(regEx) != null) {
				return $scope.errors.birth_date = false;
			}else {
				$scope.errors.birth_date = 'Invalid format birth date'; 
			}
		}

		$scope.checkIfSelected = function(option,user_option) {

			if(option == user_option) {
				return true;
			}else {
				return false;
			}
		}

	    
		$scope.viewCustomer = function($index) {
			console.log($index);
            $scope.customer = $scope.client_list[$index];
            $scope.old_customer = $scope.client_list[$index];
            $scope.customer_index = $index;

        }

        // $scope.searchFn = function() {


        //   var category = $("#category").find(":selected").text();
        //   var gender = $("#gender").find(":selected").text();
        //   var min = $("#minimum").val();
        //   var max = $("#maximum").val();
        //   var name = $("#name").val();
          	
        //   $scope.client_list == $scope.original_client_list;

        //   $scope.filtered_client_list = [];

        // //   if(category == "--") {
        // //   	$scope.client_list == $scope.original_client_list;
        // //   }else {

        // //   	 if(category != "--") {
	       // //     	angular.forEach($scope.client_list, function(value, index) {
		      // // 	   	if(category == value.role) {
		  			 // // $scope.filtered_client_list.push(value);	
		      // // 	    }
	       // //      })
		      // //  $scope.client_list = $scope.filtered_client_list;
	       // //    }

        // //   }

        // }

        $scope.filterCategory = function() {
        	$scope.filter_cat = $('#category').val();
        }

        $scope.filterGender = function() {
        	$scope.filter_gender = $('#gender').val();
        }

        function formatDate(date) {
		    var d = new Date(date),
		        month = '' + (d.getMonth() + 1),
		        day = '' + d.getDate(),
		        year = d.getFullYear();

		    if (month.length < 2) month = '0' + month;
		    if (day.length < 2) day = '0' + day;

		    return [year, month, day].join('-');
		}

        $scope.archiveUser = function($index, archive) {
        	 $scope.customer = $scope.client_list[$index];
        	 $scope.customer.archive = archive;
        	 $scope.customer.discharged_date = new Date();
        	 $scope.customer.discharged_date = formatDate($scope.customer.discharged_date);
        	 $scope.client_list[$index].archive = archive;
        	 $scope.client_list[$index].discharged_date = $scope.customer.discharged_date;

        	clientService.updateClient($scope.customer,$scope.customer.id).then(function(res) {
                    $scope.sending = 'off';
                    if(res.data.errors) {
                        $scope.errors.forgot = res.data.errors.email;
                        return;
                    }else {


                        $scope.success = "Successfully updated client.";
                        localStorage.user = JSON.stringify($scope.user);
                        angular.element('#updateClient').modal('hide');
                        $scope.client_list[$scope.customer_index] = $scope.customer;
                        $scope.loader_hide =true;

                    }
                    $scope.saving = false;
                    $scope.landing = 'reset_view';
                }).catch(function(res) {
                    $scope.sending = 'off';
                    console.log(res);
                });
        }

        $scope.updateClientByOwner = function($index) {
            var month = document.getElementById("Monthup").value;
            var day = document.getElementById("Dateup").value;
            var year = document.getElementById("Yearup").value;
            $scope.loader_hide =false;

            if(month <= 9){
                month = '0'+month;
            }
            $scope.customer.birth_date = year+'-'+month+'-'+day;

            $scope.requiredValidator($scope.customer.first_name, 'first_name');
            $scope.requiredValidator($scope.customer.last_name, 'last_name');
            $scope.checkGender($scope.customer.gender);
            $scope.isValidDate($scope.customer.birth_date);

            if($scope.errors.first_name != false || $scope.errors.last_name != false 
             || $scope.errors.gender != false ||  $scope.errors.birth_date != false) {
                return false;
            }

            $scope.customer.name = $scope.customer.first_name +' '+ $scope.customer.last_name;


            $scope.saving = true;
            clientService.updateClient($scope.customer,$scope.customer.id).then(function(res) {
                    $scope.sending = 'off';
                    if(res.data.errors) {
                        $scope.errors.forgot = res.data.errors.email;
                        return;
                    }else {


                        $scope.success = "Successfully updated client.";
                        localStorage.user = JSON.stringify($scope.user);
                        angular.element('#updateClient').modal('hide');
                        $scope.client_list[$scope.customer_index] = $scope.customer;
                        $scope.loader_hide =true;

                    }
                    $scope.saving = false;
                    $scope.landing = 'reset_view';
                }).catch(function(res) {
                    $scope.sending = 'off';
                    console.log(res);
                });
        }

        $scope.filterByCustomer = function() {

        	return function (obj) {

        		if($scope.user["role"] == "admin" && obj["role"] != "admin") {
        			return true;
        		}else if($scope.user["role"] == "professional") {
        			return true;
        			
        		}else {
        			return false;
        		}

        		return false;
        	}
			
		}


		$scope.filterByClientSubscription = function() {

        	
    		return function (obj) {
        		if($scope.user["role"] == "admin") {
        			return true;
        		}else if($scope.user["role"] == "professional") {
 					return true;
       //  			if($scope.user.customer.length > 0) {
       //  				for(i = 0; i < $scope.user.customer.length; i++){
       //  					if(obj.client_id == parseInt($scope.user.customer[i]["customer_id"])) {

							// 	return true;
							// }
       //  				}
       //  			}
        			
        		}else {
        			if($scope.user.id == obj.client_id) {
        				return true;
        			}
    			}

    			return false;

    			 	
        	}
			
		}

    }

    function ClientController($scope, $location, clientService)
    {	
        var self = this;
		self.errors = {};
		self.reg = {};
		self.base_url = $location.protocol() + "://" + location.host;
		var month,day,year;

		self.submitRegister = function() {
			
			self.errors = {};
			self.reg.password = "1234567";
			self.reg.c_password = "1234567";
			self.requiredValidator(self.reg.first_name, 'first_name');
			self.requiredValidator(self.reg.last_name, 'last_name');
			self.validateEmail(self.reg.email);
			self.validatePassword(self.reg.password);
			self.validateConfirmPass(self.reg.c_password, 'confpassword');
			self.checkGender(self.reg.gender);
			if(self.reg.birth_month <= 9){

				month = '0'+self.reg.birth_month;
			}else{
				month = self.reg.birth_month;
			}
			self.reg.birth_date = self.reg.birth_year+'-'+month+'-'+self.reg.birth_day;
			self.isValidDate(self.reg.birth_date);


			var err = $.map(self.errors, function(e) {
				console.log(e);
				if(e != false) {
					return e;
				}
			});
			console.log(self.errors,'erros');

			if(err.length == 0) {
				
				// temporarily set static values
				self.reg.profession_type = 1;
				self.reg.group_type = 1;
				self.reg.user_type = 1;
				self.reg.role = 'client';
				self.reg.age = 23;
				self.reg.owner_id = $scope.user["id"];
				console.log(self.reg);
				clientService.register(self.reg, self.base_url).then(function(res) {
					if(res.data.success) {
						self.success = 'Client successfully added.'
						$('#newClient').animate({scrollTop:0}, 'slow');
						$scope.getClientList();
						self.reg = [];
					} else if(res.data.errors) {
						angular.forEach(res.data.errors, function(value, key) {
							self.errors[value.field] = value.message;
						})
						// $scope.errors = res.data.errors;
					}
				}).catch(function(res){
					$scope.errors = res.errors;
				})
			}
		}

		self.requiredValidator = function(text, field) {
			if(text == '' || text == undefined) {
				self.errors[field] = $scope.ucfirst(field).replace('_', ' ') + ' is required';
			} else if(!$scope.checkAlpha(text)) {
				self.errors[field] = $scope.ucfirst(field).replace('_', ' ') + ' must be a string';
			}else {
				console.log(field);
				return self.errors[field] = false;
			}
		}

		self.validateEmail = function(email) {
			if(email == '' || email == undefined) {
				self.errors.email = 'Email is required';
				self.can_submit = false;
			} else if(!$scope.checkEmail(email)) {
				self.errors.email = 'Please input a valid email';
				self.can_submit = false;
			} else {
				self.can_submit = true;
				return self.errors.email = false;
			}
		}

		self.validatePassword = function(password) {
			if(password == '' || password == undefined) {
				self.errors.password = 'Password is required';
			} else if(password.length < 6) {
				self.errors.password = 'Password must be at least 6 characters';
			} else {
				self.can_submit = true;
				return self.errors.password = false;
			}
		}

		self.validateConfirmPass = function() {
			if(self.reg.password == '' || self.reg.password == undefined) {
				self.errors.c_password = 'Confirm Password is required';
			} else if(!angular.equals(self.reg.password, self.reg.c_password)) {
				self.errors.c_password = 'Password and Confirm Password did not match';
			} else {
				self.can_submit = true;
				return self.errors.c_password = false;
			}
		}

		self.checkGender = function(gender) {
			if(gender == '' || gender == undefined) {
				self.errors.gender = 'Gender is required';
			} else {
				return self.errors.gender = false;
			}
		}

		self.checkRole = function(role) {
			if(role == '' || role == undefined) {
				self.errors.role = 'Role is required';
			} else {
				return self.errors.role = false;
			}
		}

		self.isValidDate = function(dateString) {
			console.log(dateString);
			var regEx = /^\d{4}-\d{2}-\d{2}$/;
			if(dateString.match(regEx) != null) {
				return self.errors.birth_date = false;
			}else {
				self.errors.birth_date = 'Birth date is required or must be a valid format'; 
			}
		}

		self.search = function () {

		}

		
    }

    function ProfileController($scope, clientService)
    {
		var self = this;
		self.user = $scope.user;

		self.updateClient = function() {
			var month = document.getElementById("birthMonth").value;
			var day = document.getElementById("birthDate").value;
			var year = document.getElementById("birthYear").value;
			$scope.loader_hide =false;

			if(month <= 9){
				month = '0'+month;
			}
			self.user.birth_date = year+'-'+month+'-'+day;

			$scope.requiredValidator(self.user.first_name, 'first_name');
			$scope.requiredValidator(self.user.last_name, 'last_name');
			$scope.checkGender(self.user.gender);
			$scope.isValidDate(self.user.birth_date);

			if($scope.errors.first_name != false || $scope.errors.last_name != false 
			 || $scope.errors.gender != false ||  $scope.errors.birth_date != false) {
				return false;
			}

			self.user.name = self.user.first_name +' '+ self.user.last_name;



			clientService.updateClient(self.user,$scope.user.id).then(function(res) {
				$scope.sending = 'off';
				if(res.data.errors) {
					$scope.errors.forgot = res.data.errors.email;
					return;
				}else {


					$scope.success = "Successfully updated client.";
					localStorage.user = JSON.stringify(self.user);
					angular.element('#newClient').modal('hide');
					$scope.loader_hide =true;
					self.user.age = $scope.getAge(self.user.birth_date) + ' years old';

				}
				$scope.landing = 'reset_view';
			}).catch(function(res) {
				$scope.sending = 'off';
				console.log(res);
			});
		}

		self.cancel = function() {
			$scope.user = $scope.old_user;
		}
    }

    function SubscriptionController($scope, clientService, $filter)
    {
    	var self = this;
    	self.code = {};
    	self.errors = {};
    	self.edit_subscription = false;

    	self.getAllSubscription = function() {
	    	clientService.getClientSubscription().then(function(res) {
				self.client_subscriptions = [];
				self._client_list = res.data.success;
				self.total_client_count = res.data.success.total;
				self.limit = 10;
				angular.forEach(self._client_list, function(value, key){
					if(!isNaN(parseInt(key))) {
						value.purchased_date = value.purchased_date ? $filter('date')(new Date(value.purchased_date), "MMM d, y h:mm:ss a") : '--';
						value.date_expired = new Date(value.date_expired);
						self.client_subscriptions.push(value);
					}
				})
				console.log(self.client_subscriptions);
				self.all_client_subscription = self.client_subscriptions;
				$(".loader-head").addClass("hidden"); 

			}).catch(function(res) {
				$scope.sending = 'off';
				console.log(res);
			});
		}

		self.filterCode = function(filter, flag = null) {
			$scope.code_filter = filter;

			if(flag == 'search') {
				self.client_subscriptions = [];
				angular.forEach(self.all_client_subscription, function(value, key){
					if(value.user != null) {
						name = angular.uppercase(value.user.name);
						if(name.search(angular.uppercase($scope.filter_search)) !== -1) {
							value.purchased_date = new Date(value.purchased_date);
							value.date_expired = new Date(value.date_expired);
							self.client_subscriptions.push(value);
						}
					}else if ($scope.filter_search == '' || $scope.filter_search == null || $scope.filter_search == undefined) {
						self.client_subscriptions == self.all_client_subscription
					}
				})

				return;
			}

			if(filter == "all") {
				self.client_subscriptions = self.all_client_subscription;
			}else {
				self.client_subscriptions = [];
				angular.forEach(self.all_client_subscription, function(value, key){
					
					if(value.status == $scope.code_filter) {
						value.purchased_date = new Date(value.purchased_date);
						value.date_expired = new Date(value.date_expired);
						self.client_subscriptions.push(value);
					}
					
				})
			}
			

		}

		self.showAllUsers = function(flag) {
			if(flag == 'add') {
				$('#addClient').modal();
				self.edit_subscription = false;
				self.subscription = {};
				self.code = {};
			} else {
				$('#updateClient').modal();
			}
        	
        	if(!self.edit_subscription) {
        		self.code.code = self.makeRandom(10).toUpperCase();
        	}

        	var select;
        	
			clientService.showAllUsers().then(function(res) {
				self.users_list = res.data.success;
				self.options = [];

				angular.forEach(self.users_list, function(value, key) {

					if($.type(value) == 'object') {
						self.options.push(value);	
					}
				});

				if(self.edit_subscription) {
					select = $('#client-name').selectize({
						maxItems: 1,
						valueField: 'id',
						labelField: 'name',
						searchField: 'name',
						options: self.options,
						create: false,
						onChange: function(value) {
							self.code.client_id = value;
						}
					});
					var selectize = select[0].selectize;
					selectize.setValue(self.subscription.client_id);
				} else {
					select = $('#add-client-name').selectize({
						maxItems: 1,
						valueField: 'id',
						labelField: 'name',
						searchField: 'name',
						options: self.options,
						create: false,
						onChange: function(value) {
							self.code.client_id = value;
						}
					});
				}

			}).catch(function(res) {
				if(res.error) {
					console.log(res.error)
				}
			})
		}

		self.updateSubscription = function(index) {
			self.code = {};
			self.edit_subscription = true;
			self.showAllUsers('edit');

			self.subscription = angular.copy(self.client_subscriptions[index]);
			console.log(self.subscription)
			self.subscription.purchased_date = self.subscription.purchased_date != '--' ? new Date(self.subscription.purchased_date) : '--';
			console.log(self.subscription)
			self.code.code = self.subscription.code
		}

		self.makeRandom = function(len) {
			var text = "";
			var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

			for (var i = 0; i < len; i++)
			text += possible.charAt(Math.floor(Math.random() * possible.length));

			return text;
		}

		self.updateCode = function(id) {
			var year = $('#Pyearup').val();
			var month = $('#Pmonthup').val();
			var day = $('#Pdateup').val();
			
			// either of the date, check if its valid
			if(year || month || day) {
				self.code.purchased_date = $('#Pyearup').val() + '-' + $('#Pmonthup').val() + '-' + $('#Pdateup').val();
				console.log(self.code.purchased_date)
				self.isValidDate(self.code.purchased_date, 'purchase');
			}

			// date must be filled
			if(year && month && day) {
				self.code.purchased_date = $('#Pyearup').val() + '-' + $('#Pmonthup').val() + '-' + $('#Pdateup').val();
			}

			self.code.client_id = self.code.client_id ? self.code.client_id : 0;

			self.code.status = self.code.client_id != 0 ? 'active' : 'unassigned';
			
			self.code.date_expired = $('#Eyearup').val() + '-' + $('#Emonthup').val() + '-' + $('#Edateup').val();
			self.isValidDate(self.code.date_expired, 'expired');
			
			if(!self.errors.date_expired) {
				self.errors = {};
				self.code.date_expired = angular.copy(self.code.date_expired + ' 00:00:00')
				self.code.purchased_date = self.code.purchased_date ? angular.copy(self.code.purchased_date + ' 00:00:00') : null;
				clientService.updateSubscription(self.code, id).then(function(res) {
					if(res.data.success) {
						self.getAllSubscription();
						$('#updateClient').modal('hide');
					}
				}).catch(function(res) {
					console.log(res.data.error)
				})
			}
		}

		self.saveCode = function() {
			var year = $('#aPyearup').val();
			var month = $('#aPmonthup').val();
			var day = $('#aPdateup').val();
			
			// either of the date, check if its valid
			if(year || month || day) {

				month = month < 10 ? 0+month : month;
				self.code.purchased_date = $('#aPyearup').val() + '-' + month + '-' + $('#aPdateup').val();
				
				self.isValidDate(self.code.purchased_date, 'purchase');
			}

			// date must be filled
			if(year && month && day) {
				self.code.purchased_date = $('#aPyearup').val() + '-' + $('#aPmonthup').val() + '-' + $('#aPdateup').val();
			}

			self.code.client_id = self.code.client_id ? self.code.client_id : 0;

			self.code.status = self.code.client_id != 0 ? 'active' : 'unassigned';
			var emonth =  $('#aEmonthup').val() < 10 ? 0+$('#aEmonthup').val():$('#aEmonthup').val();
			self.code.date_expired = $('#aEyearup').val() + '-' + emonth + '-' + $('#aEdateup').val();
			
			self.isValidDate(self.code.date_expired, 'expired');
			
			if(!self.errors.date_expired) {
				self.code.date_expired = angular.copy(self.code.date_expired + ' 00:00:00')
				self.code.purchased_date = self.code.purchased_date ? angular.copy(self.code.purchased_date + ' 00:00:00') : null;
				clientService.saveSubscription(self.code).then(function(res) {
					if(res.data.success) {
						self.getAllSubscription();
						$('#addClient').modal('hide');
					}
				}).catch(function(res) {
					console.log(res.data.error)
				})
			}
		}

		self.isValidDate = function(dateString, type) {
			var regEx = /^\d{4}-\d{2}-\d{2}$/;
			if(dateString.match(regEx) != null) {
				if(type == 'expired') {
					return self.errors.date_expired = false;	
				} else {
					return self.errors.purchased_date = false;
				}
				
			}else {
				if(type == 'expired') {
					self.errors.date_expired = 'Expiry Date is required or must be a valid format'; 	
				} else {
					self.errors.purchased_date = 'Purchase Date must be a valid format'; 
				}
				
			}
		}
    }


     function ChangeController($scope, clientService, $filter)
    {	
    	$scope.errors = [];

		$scope.submitChangePass = function() {
			if($scope.errors["password"] == "" && $scope.errors["c_password"] == ""){
				var data = {
					"email" : $scope.user.email,
					"new_password" : $scope.password
				}

				clientService.changePassword(data).then(function(res) {
					if(res.data.success) {
						window.location.href = '/clients/#!/change-password-success';
					}
				}).catch(function(res) {
					console.log(res.data.error)
				})

				
				
			}else{
				return false;
			}
		}

		$scope.checkPassword = function(password,field) {
			if(password.length < 7) {
				if(field == "password") {
					$scope.errors[field] = "password must be equal or greater than 7 characters.";
				}else {
					$scope.errors[field] = "password doesn't match.";
				}

			}else {
				if(field == "c_password" && $scope.password != password) {
					$scope.errors[field] = "password doesn't match.";
				}else{
					$scope.errors[field] = "";
				}
			}
		}

    	
		
    }

