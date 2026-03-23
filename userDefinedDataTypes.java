public class userDefinedDataTypes {

    public static class Student{
        String name;
        int rollNo;
        double cgpa;
    }
    public static void main(String[] args) {
       Student s1 = new Student();
       s1.name = "John Doe";
       s1.rollNo = 12345;
       s1.cgpa = 3.75; 

       Student s2 = new Student();
       s2.name = "Jane Smith";
       s2.rollNo = 67890;
       s2.cgpa = 3.85;

       System.out.println("Student 1: " + s1.name + ", Roll No: " + s1.rollNo + ", CGPA: " + s1.cgpa);
       System.out.println("Student 2: " + s2.name + ", Roll No: " + s2.rollNo + ", CGPA: " + s2.cgpa);
    }
}
