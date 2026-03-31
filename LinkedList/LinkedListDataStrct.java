class Node {
    int val;
    Node next;
    Node(int val) {
        this.val = val;
    }
}

class LinkedList { //user defined data strcuture
    Node head;
    Node tail;

    int Search (int val){
        if(head == null) return -1;
        Node temp = head;
        int idx = 0;
        while (temp != null){
            if(temp.val == val) return idx;
            temp = temp.next;
            idx++;
        }
        return -1;
    }
    void addAtTail(int val) {
        Node temp =  new Node(val);
        if(head == null) head = tail = temp;
        else{
            tail.next = temp;
            tail = temp;
        }
    }

    void addAtHead(int val) {
        Node temp = new Node(val);
        if(head == null) head = tail = temp;
        else{
            temp.next = head;
            head = temp;
        }
    }
    void deleteAtHead() {
        if(head == null) return;
        head = head.next;
        if(head == null) tail = null;
    }

    void display() {
        if(head == null) return;
        Node temp = head;
        while(temp != null){
            System.out.print(temp.val+" ");
            temp = temp.next;
        }
        System.out.println();
    }

    void Instert(int val, int idx) {
        Node temp = head;
        int size = 0;
        while(temp != null) {
            size++;
            temp = temp.next;
        }
        if(idx < 0|| idx > size){ 
            System.out.println("Invalid Index");
            return ;
        }
        if(idx == 0) addAtHead(val);
        else if(idx == size) addAtTail(val);
        else {
            temp = head;
            for(int i=0;i<idx-1;i++) temp = temp.next;
            Node newNode = new Node(val);
            newNode.next = temp.next;
            temp.next = newNode;
            size++;
        }

    }

}



public class LinkedListDataStrct {

    public static void main(String[] args) {
         LinkedList ll = new LinkedList();
         ll.addAtTail(10);
         ll.addAtTail(20);
         ll.addAtTail(30);
         ll.addAtTail(40);
         ll.display();
         ll.addAtHead(5);
         ll.display();
         ll.deleteAtHead();
         ll.display();
        System.out.println(ll.Search(30));
            ll.Instert(25, 2);
            ll.display();
    }
}


