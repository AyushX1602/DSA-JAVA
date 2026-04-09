class ListNode {
    int val;
    ListNode next;
    ListNode prev;
    ListNode(int val) {
        this.val = val;
    } 
}
class DLL{
    ListNode head;
    ListNode tail;
    int size;
    void insertAtHead(int val){
        ListNode temp = new ListNode(val);
        if(head == null) head = tail = temp;
        else{
            temp.next = head;
            head.prev = temp;
            head = temp;
        }
        size++;
    }

    void insertAtTail(int val){
        ListNode temp = new ListNode(val);
        if(head == null) head = tail = temp;
        else{
            tail.next = temp;
            temp.prev = tail;
            tail = temp;
        }
        size++;
    }

    void display(){
        if(head == null) return;
        ListNode temp = head;
        while(temp != null){
            System.out.print(temp.val+" ");
            temp = temp.next;
        }
        System.out.println();
    }

    void deleteAtHead(){
        if(head == null) return;
        head= head.next;
        if(head!=null) head.prev = null;
        else tail = null;
    } 
    void deleteAtTail(){
        if(head == null) return;
        tail = tail.prev;
        if(tail != null) tail.next = null;
        else head = null;
    }

    void insert(int idx,int val){

        if(idx<0 || idx>size) return;
        if(idx == 0) {insertAtHead(val);
            return;
        }
        if(idx == size) {insertAtTail(val);
            return;
        }
        ListNode a = new ListNode(val);
        ListNode temp = head;
        for(int i=0;i<idx-1;i++){
            temp = temp.next;
        }
        ListNode b = temp.next;
        temp.next = a;
        a.prev = temp;
        a.next = b; 
        b.prev = a;
        size++;
    }



    void delete(int idx){
        if(idx<0 || idx>=size) return;
        if(idx == 0) {deleteAtHead();
            return;
        }
        if(idx == size-1) {deleteAtTail();
            return;
        }

        ListNode temp = head;
        for(int i=0;i<idx-1;i++){
            temp = temp.next;
        }
        ListNode b = temp.next;
        temp.next = b.next;
        b.next.prev = temp;
        size--;

    }
}


public class DoublyLLclass {
    public static void main(String[] args) {
        DLL list = new DLL();
        list.insertAtHead(10);
        list.insertAtHead(20);  
        list.insertAtTail(30);
        list.insertAtTail(40);
        list.insert(2,25);
        list.display();
        list.deleteAtHead();
        list.deleteAtTail();
        list.delete(1);
        list.display();
        
    }
}
