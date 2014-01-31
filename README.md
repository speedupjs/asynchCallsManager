asynchCallsManager
==================

AsynchCallsManager is a project which helps manage async calls in javascript. 
Using this, you can define complex async call sequences. It's unlike jquery promise object and easy to use.

Let us take a scenario where you have three async functions a,b and c.

And if you want the following execution flow:

  1. Call async function a and b.
  2. Once both responses are received, call function c,
  
Few people would write their own logic taking into consideration the 'race around condition'.
And few others would use jquery promise object with 'when'. 
And jquery promise object has few more beautiful methods like 'then', 'done', 'fail','always'.

But let's take scenario where you have eight ten ASYNC functions a,b,c,d,e,f,g,h,i and j and if you would want following execution
sequence:
  
  1. Call a, d and e.
  2. On success of a, call c and f.
  3. On error of a, call b.
  4. On success of d, call g.
  5. On success of e call i.
  6. Call j either when c returns success or, when both f and g return success
  7. On success of i and h call j.
  
And probably once, everything is done and when there is no open requeset left, you would want to do DO_SOMETHING().

You can make out that, taking into consideration the 'race around conditioin' , 
it becomes very difficult for you to 'program' for this execution flow.

-----------------------------------------------------------------------------

HOW DOES 'asynchCallsManager.js' HELP YOU??

  
With asyncCallsManager, Let me illustrate how you can achieve this.:



You define an object, to be supplied as constructor parameter to the callsManager.

            Note: When each function is invoked by the calls manager parametes 'o' and 'c' will be supplied.
                  o.success(o,..     , o.error(o,...     , o.complete(o,.....  forms protocol functions. 
                  
                  
var methods=  {                                    //in method you define all you functions.
                      a:{
                      
                          job:function(o,c){
                                callAsync1(function(){
                                  o.success(c);                       //o.success(c) is mandatory.
                                },function(){
                                  o.error(c);                         //o.error(c) is mandatory.
                                })
                          
                          },                       
                      
                      },
                      
                      
                      b:{
                      
                          job:function(o,c){
                                callAsync1(function(){
                                  o.success(c);
                                },function(){
                                  o.error(c);
                                })
                          
                          }
                      
                      },
                      ....
                      ...
                      .........
                      
                     j:{
                      
                          job:function(o,c){
                                callAsync1(function(){
                                  o.success(c);
                                },function(){
                                  o.error(c);
                                })
                          
                          }
                      
                      }
                  
      }
        
        
Note: Please note that in the above definitions, no branching logic was written.     

Now you will define the sequence object,where you define the sequence

var sequenceObj=[{
                    name:'a'
                  },{
                    name:'d'
                  
                  },{
                    name:'e'
                  },{
                    name:'c',
                    dependsOn:["a.success"]
                  },{
                    name:'f',
                    dependsOn:["a.success"]
                  },{
                    name:'b',
                    dependsOn:["a.error"]
                  },{
                    name:'g',
                    dependsOn:["d.success"]
                  },{
                    name:'i',
                    dependsOn:["e.success"]
                  },{
                    name:"h",
                    dependsOn:["c.success",["f.success","g.success"]]  // this tells that h should be invoked either when 
                                                                      // c succcess or when 'both f and g return success.
                  },{
                    name:"j",
                    dependsOn:[["i.success","h.success"]]
                  }
                  
                  ]
                  

Now let us insantiate the callManager.

var jobQueue= new callManager({
              onBegin:function(){       //optional parameter
                  //do something
              },
              methodPool:methods,         // this object which contains all the function jobs, success, error handlers
              sequence: sequencObj,       // object that contains the sequence of execution.
              onAllDone:function(){       // optional 
                  //do something
              }
            });
            
And now you start execution

jobQueue.begin();

// This will trigger the  execution sequence. 



And you can see that with if any moment you want to change the execution sequence you will just change the sequence object,
without tampering your function definition. :) :)
  

  
