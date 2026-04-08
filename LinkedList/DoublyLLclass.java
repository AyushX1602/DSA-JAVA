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


}


public class DoublyLLclass {
    public static void main(String[] args) {
        DLL list = new DLL();
    }
}
